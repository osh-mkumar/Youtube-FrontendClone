const { useState, useEffect } = React;

function useDataset() {
  const [data, setData] = useState({ videos: [], sidebar: [], notifications: [], user: {} });

  useEffect(() => {
    let mounted = true;
    fetch('dataset.json')
      .then(r => r.json()) 
      .then(d => {
        if (!mounted) return;
        // restore persisted notifications and user if available
        try {
          const savedN = localStorage.getItem('yt_notifications');
          if (savedN) d.notifications = JSON.parse(savedN);
        } catch (_) {}
        try {
          const savedU = localStorage.getItem('yt_user');
          if (savedU) d.user = JSON.parse(savedU);
        } catch (_) {}
        setData(d);
      })
      .catch(err => { console.error('Failed to load dataset.json', err); });
    return () => { mounted = false; };
  }, []);

  return [data, setData];
}

function App() {
  const [data, setData] = useDataset();
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Build visible videos based on active category and query.
  const videos = (() => {
    const all = data.videos || [];
    const q = query ? query.toLowerCase() : '';

    // If user selected Subscriptions, read subscribed authors from localStorage
    if (activeCategory === 'subscriptions') {
      try {
        const subs = JSON.parse(localStorage.getItem('yt_subscriptions')) || [];
        return all.filter(v => subs.includes(v.author) && (!q || (v.title && v.title.toLowerCase().includes(q)) || (v.author && v.author.toLowerCase().includes(q))));
      } catch (_) {
        return all.filter(v => Array.isArray(v.categories) && v.categories.includes('subscriptions') && (!q || (v.title && v.title.toLowerCase().includes(q)) || (v.author && v.author.toLowerCase().includes(q))));
      }
    }

    return all.filter(v => {
      if (activeCategory && activeCategory !== 'all') {
        if (!Array.isArray(v.categories) || !v.categories.includes(activeCategory)) return false;
      }
      if (!q) return true;
      return (v.title && v.title.toLowerCase().includes(q)) || (v.author && v.author.toLowerCase().includes(q));
    });
  })();

  const match = route.match(/^#\/video\/(.+)$/);
  const videoId = match ? match[1] : null;

  function openNotification(n) {
    if (!n) return;
    const updated = (data.notifications || []).map(x => x.id === n.id ? { ...x, unread: false } : x);
    try { localStorage.setItem('yt_notifications', JSON.stringify(updated)); } catch (_) {}
    setData(d => ({ ...d, notifications: updated }));
    if (n.videoId) {
      window.location.hash = `#/video/${n.videoId}`;
    }
  }

  function saveProfile(newUser) {
    try { localStorage.setItem('yt_user', JSON.stringify(newUser)); } catch (_) {}
    setData(d => ({ ...d, user: newUser }));
    setShowProfile(false);
  }

  return (
    <div className="app-root">
      <Header
        query={query}
        setQuery={setQuery}
        onHome={() => { setActiveCategory('all'); setQuery(''); window.location.hash = '#/'; }}
        notifications={data.notifications || []}
        onOpenNotification={openNotification}
        user={data.user || {}}
        onOpenProfile={() => setShowProfile(true)}
      />
      <div className="main-with-sidebar">
        <Sidebar items={data.sidebar || []} active={activeCategory} onActivate={id => { setActiveCategory(id); window.location.hash = '#/'; }} />
        <div className="content-area">
            {videoId ? (
              <VideoPage id={videoId} videos={data.videos || []} />
            ) : (
              <VideoGrid videos={videos} />
            )}
        </div>
      </div>
        {showProfile && <ProfileModal user={data.user || {}} onSave={saveProfile} onClose={() => setShowProfile(false)} />}
    </div>
  );
}

function Header({ query, setQuery, onHome, notifications, onOpenNotification, user, onOpenProfile }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="header">
      <div className="left-section">
        <img className="hamburger-menu" src="icons/hamburger-menu.svg" onClick={() => { document.body.classList.toggle('sidebar-collapsed'); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.body.classList.toggle('sidebar-collapsed'); }} role="button" tabIndex={0} aria-label="Toggle sidebar" />
        <a href="#/" className="youtube-logo-link" onClick={(e)=>{ e.preventDefault(); if (typeof onHome === 'function') onHome(); else if(typeof window !== 'undefined') window.location.hash = '#/'; }}><img className="youtube-logo" src="icons/youtube-logo.svg" /></a>
      </div>
      <div className="middle-section">
        <input className="search-bar" type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search" />
        <button className="search-button"><img className="search-icon" src="icons/search.svg" /></button>
        <button className="voice-search-button"><img className="voice-search-icon" src="icons/voice-search-icon.svg" /></button>
      </div>
      <div className="right-section">
        <img className="upload-icon" src="icons/upload.svg" />
        <img className="youtube-apps-icon" src="icons/youtube-apps.svg" />
        <div className="notifications-icon-container" style={{position:'relative'}}>
          <img className="notifications-icon" src="icons/notifications.svg" onClick={() => setOpen(o => !o)} />
          <div className="notifications-count">{(notifications || []).filter(n => n.unread).length}</div>
          {open && (
            <div className="notifications-dropdown" style={{position:'absolute', right:0, top:40, width:320, background:'#fff', boxShadow:'0 8px 24px rgba(0,0,0,0.15)', borderRadius:6, zIndex:200}}> 
              {(notifications || []).length === 0 ? <div style={{padding:12}}>No notifications</div> : (
                (notifications || []).map(n => (
                  <div key={n.id} className="notification-row" style={{padding:10, borderBottom:'1px solid #eee', cursor:'pointer'}} onClick={() => { onOpenNotification && onOpenNotification(n); setOpen(false); }}>
                    <div style={{fontWeight: n.unread ? 700 : 400, fontSize:14, marginBottom:6}}>{n.title}</div>
                    <div style={{fontSize:12, color:'#666'}}>{n.from} • {n.time}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <img className="current-user-picture" src={user && user.avatar ? user.avatar : 'e0af562f1889be281e3052c2aea5ae37.jpeg'} style={{cursor:'pointer'}} onClick={() => { if (typeof onOpenProfile === 'function') onOpenProfile(); }} />
      </div>
    </div>
  );
}

function Sidebar({ items, active, onActivate }) {
  return (
    <div className="sidebar" id="sidebar">
      {items.map(it => (
        <div key={it.id} className={`sidebar-link ${it.id === active ? 'active' : ''}`} onClick={() => { if (typeof onActivate === 'function') onActivate(it.id); }}>
          <img src={it.icon} />
          <div>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

function VideoGrid({ videos }) {
  return (
    <div className="video-grid" id="video-grid">
      {videos.map(v => (
        <VideoCard key={v.id} v={v} />
      ))}
    </div>
  );
}

function VideoCard({ v }) {
  return (
    <div className="video-preview" onClick={() => (window.location.hash = `#/video/${v.id}`)} style={{ cursor: 'pointer' }}>
      <div className="thumbnail-row"><img className="thumbnail" src={v.thumbnail} /></div>
      <div className="video-info-grid">
        <div className="channel-picture"><img className="profile-picture" src={v.channelPicture} /></div>
        <div className="video-info">
          <p className="video title">{v.title}</p>
          <p className="video-author">{v.author}</p>
          <p className="video-stats">{v.views} views • {v.age}</p>
        </div>
      </div>
    </div>
  );
}

function VideoPage({ id, videos }) {
  const v = (videos || []).find(x => x.id === id);
  const initialCounts = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`counts_${id}`));
      if (saved && typeof saved.likes === 'number') return saved;
    } catch {}
    return { likes: v?.likes || 0, dislikes: v?.dislikes || 0 };
  })();

  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`like_${id}`)) || false; } catch { return false; }
  });
  const [disliked, setDisliked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`dislike_${id}`)) || false; } catch { return false; }
  });
  const [counts, setCounts] = useState(initialCounts);

  // Comments state
const [comments, setComments] = useState(() => {
  try {
    const saved = localStorage.getItem(`comments_${id}`);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    {id:1, username:"User12", text:"Great video!"},
    {id:2, username:"Lucky123", text:"Really informative, thanks!"},
    {id:3, username:"!6xUser", text:"Loved this part."},
    {id:4, username:"Rose Watcher", text:"Can you make a follow-up video?"}
  ];
});


  const channelKey = v ? `sub_${v.author.replace(/\s+/g, '_')}` : null;
  const initialSub = (() => {
    try { return v ? (JSON.parse(localStorage.getItem(channelKey)) || false) : false; } catch { return false; }
  })();
  const [subscribed, setSubscribed] = useState(initialSub);
  const [subCount, setSubCount] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`subcount_${v?.author}`));
      if (typeof saved === 'number') return saved;
    } catch {}
    return v?.channelSubscribers || 0;
  });

  useEffect(() => { try { localStorage.setItem(`like_${id}`, JSON.stringify(liked)); } catch {} }, [liked]);
  useEffect(() => { try { localStorage.setItem(`dislike_${id}`, JSON.stringify(disliked)); } catch {} }, [disliked]);
  useEffect(() => { try { localStorage.setItem(`counts_${id}`, JSON.stringify(counts)); } catch {} }, [counts]);
  useEffect(() => { if (channelKey) try { localStorage.setItem(channelKey, JSON.stringify(subscribed)); } catch {} }, [subscribed, channelKey]);
  useEffect(() => { if (v) try { localStorage.setItem(`subcount_${v.author}`, JSON.stringify(subCount)); } catch {} }, [subCount, v]);

  if (!v) return <div style={{ padding: 20 }}>Video not found.</div>;

  const onLike = (e) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setCounts(c => ({ ...c, likes: Math.max(0, c.likes - 1) }));
    } else {
      setLiked(true);
      setDisliked(false);
      setCounts(c => ({ ...c, likes: c.likes + 1, dislikes: Math.max(0, c.dislikes - (disliked ? 1 : 0)) }));
    }
  };
  const onDislike = (e) => {
    e.stopPropagation();
    if (disliked) {
      setDisliked(false);
      setCounts(c => ({ ...c, dislikes: Math.max(0, c.dislikes - 1) }));
    } else {
      setDisliked(true);
      setLiked(false);
      setCounts(c => ({ ...c, dislikes: c.dislikes + 1, likes: Math.max(0, c.likes - (liked ? 1 : 0)) }));
    }
  };
  const onSubscribe = (e) => {
    e.stopPropagation();
    setSubscribed(s => {
      const next = !s;
      setSubCount(n => next ? n + 1 : Math.max(0, n - 1));

      // update global subscriptions list in localStorage
      try {
        const key = 'yt_subscriptions';
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const author = v?.author;
        if (author) {
          if (next) {
            if (!list.includes(author)) list.push(author);
          } else {
            const idx = list.indexOf(author);
            if (idx !== -1) list.splice(idx, 1);
          }
          localStorage.setItem(key, JSON.stringify(list));
        }
      } catch (_) {}

      return next;
    });
  };

  return (
    <div className="video-page" style={{ padding: 16 }}>
      <div className="video-page-inner">
        <div className="video-main">
          <div className="video-player-placeholder">
            <img src={v.thumbnail} style={{ width: '100%', maxHeight: 480, objectFit: 'cover' }} />
          </div>
          <h2 style={{ marginTop: 12 }}>{v.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={v.channelPicture} style={{ width: 48, height: 48, borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 600 }}>{v.author}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{v.views} views • {v.age}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{subCount.toLocaleString()} subscribers</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className={`like-btn ${liked ? 'active' : ''}`} onClick={onLike}><img src="icons/thumb-up.svg" style={{height:18,marginRight:6}}/> {counts.likes.toLocaleString()}</button>
              <button className={`dislike-btn ${disliked ? 'active' : ''}`} onClick={onDislike}><img src="icons/thumb-down.svg" style={{height:18,marginRight:6}}/> {counts.dislikes.toLocaleString()}</button>
              <button className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`} onClick={onSubscribe}>{subscribed ? 'Subscribed' : 'Subscribe'} • {subCount.toLocaleString()}</button>
            </div>
          </div>
        </div>

        <aside className="recommended-col">
          <div className="recommended-heading">Recommended Videoes For You</div>
          <div className="recommended-list">
            {(videos || []).filter(x => x.id !== id).map(rv => (
              <div key={rv.id} className="recommended-item" onClick={(e) => { e.stopPropagation(); window.location.hash = `#/video/${rv.id}`; }}>
                <img className="recommended-thumb" src={rv.thumbnail} />
                <div className="recommended-meta">
                  <div className="recommended-title">{rv.title}</div>
                  <div className="recommended-author">{rv.author}</div>
                  <div className="recommended-stats">{rv.views} views • {rv.age}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
            {/* Comments Section */}
  <div className="comments-section" style={{marginTop: 24}}>
    <h3>Comments</h3>
    
    {/* Comment form */}
    <form id="comment-form" onSubmit={(e) => {
        e.preventDefault();
        const input = e.target.elements.commentInput;
        const text = input.value.trim();
        if (!text) return;

        const newComment = {
          id: Date.now(),
          username: data.user?.name || "Anonymous",
          text
        };

        const updated = [...comments, newComment];
        setComments(updated);
        localStorage.setItem(`comments_${id}`, JSON.stringify(updated));
        input.value = "";
    }}>
      <input 
        type="text" 
        name="commentInput"
        placeholder="Add a public comment..." 
        style={{width:'70%', padding:8, marginRight:8}} 
        required
      />
      <button type="submit" style={{padding:'8px 12px'}}>Comment</button>
    </form>

    {/* Comments list */}
    <div style={{marginTop:16}}>
      {comments.map(c => (
        <div key={c.id} style={{marginBottom:12, padding:8, background:'#fff', borderRadius:6}}>
          <strong>{c.username}</strong>
          <p style={{margin:4}}>{c.text}</p>
        </div>
      ))}
    </div>
  </div>
    </div>
  );
}

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);

function ProfileModal({ user, onSave, onClose }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [about, setAbout] = useState(user.about || '');
  const [avatar, setAvatar] = useState(user.avatar || '');

  return (
    <div className="profile-modal-overlay" style={{position:'fixed', left:0, top:0, right:0, bottom:0, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}} onClick={(e)=>{ if(e.target.className && e.target.className.includes('profile-modal-overlay')) onClose(); }}>
      <div className="profile-modal" style={{background:'#fff', padding:18, borderRadius:8, width:420, boxShadow:'0 8px 30px rgba(0,0,0,0.2)'}}>
        <h3 style={{marginTop:0}}>Edit Profile</h3>
        <div style={{marginBottom:12}}>
          <label style={{display:'block', fontSize:13}}>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block', fontSize:13}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block', fontSize:13}}>About</label>
          <textarea value={about} onChange={e=>setAbout(e.target.value)} style={{minHeight:80}} />
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block', fontSize:13}}>Avatar (path)</label>
          <input value={avatar} onChange={e=>setAvatar(e.target.value)} />
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
          <button onClick={onClose} style={{padding:'8px 12px', background:'#f3f3f3', border:'none', borderRadius:4}}>Cancel</button>
          <button onClick={() => onSave({ name: name.trim(), email: email.trim(), about: about.trim(), avatar: avatar.trim() })} style={{padding:'8px 12px', background:'#e62b1e', color:'#fff', border:'none', borderRadius:4}}>Save</button>
        </div>
      </div>
    </div>
  );
}
