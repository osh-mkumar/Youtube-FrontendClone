# YouTube Clone - React Single Page Application (SPA)

### 🔗 [View Live Demo And Test It Yourself!](https://osh-mkumar.github.io/Youtube-FrontendClone/#/)

A high-fidelity YouTube frontend clone built as a **Single Page Application (SPA)** using **React**. This project replicates the core user experience of YouTube, featuring dynamic video rendering, real-time search, and a robust persistence layer using LocalStorage.

---

## 🚀 Key Features

* **Dynamic SPA Routing:** Implements custom hash-based routing (`#/video/:id`) to navigate between the home grid and video player pages without page reloads.
* **Persistent User Interactions:**
* **Engagement:** Like and Dislike toggles are tracked and saved per video.
* **Subscription System:** Users can subscribe to creators; state is saved globally and reflects in the "Subscriptions" filter.
* **Comment System:** Fully functional comment section allowing users to post and store comments locally.


* **Live Search & Categorization:**
* **Instant Search:** Filters the video grid by title and author in real-time.
* **Category Pills:** Dynamic sidebar items that filter the feed based on video categories.


* **User Profile Management:** Interactive modal to update Name, Email, Bio, and Avatar, with global state updates across the header and comments.
* **Smart Notifications:** Deep-linking functionality that navigates directly to specific videos from the notification dropdown.

---

## 🛠️ Tech Stack

* **Frontend Library:** React.js (Hooks: `useState`, `useEffect`)
* **Routing:** Custom Hash-Routing Logic
* **Data Handling:** Fetch API for `dataset.json`
* **Persistence:** Window LocalStorage API
* **Styling:** Modular CSS3 (Flexbox & CSS Grid)

---

## 📂 Project Structure

```text
├── icons/               # UI assets (Search, Upload, Notifications, etc.)
├── scripts/
│   └── app.js           # Core React logic, routing, and state management
├── styles/
│   ├── general.css      # Layout resets and global variables
│   ├── header.css       # Navigation bar and search styling
│   ├── sidebar.css      # Sidebar and category link styles
│   └── video.css        # Video grid and player page layouts
├── thumbnails/          # Video preview images
├── dataset.json         # Mock database for videos and sidebar data
├── youtube.html         # Main entry point (HTML skeleton)
└── README.md

```

---

## 🚦 Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/osh-mkumar/Youtube-FrontendClone.git

```


2. **Open with a Local Server:**
Since the app uses `fetch()` to load `dataset.json`, you must run it through a server (like **Live Server** in VS Code) to avoid CORS policy restrictions.
3. **Persistence:**
Interact with the app! Your likes, subscriptions, and profile changes will remain even after you refresh the page.

---

## 🧠 Logic Breakdown

### State Hydration

The app utilizes a custom hook that serves as a mini-state manager. It fetches base data and immediately merges it with `localStorage` to ensure the UI reflects the user's specific history (e.g., subscribed channels and unread notifications).

### Engagement Persistence

All interactions are keyed to the video ID in LocalStorage, ensuring that likes, dislikes, and comments are specific to each video and persist across sessions.
