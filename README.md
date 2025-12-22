# YouTube Clone - React Single Page Application (SPA)

A high-fidelity YouTube frontend clone built as a **Single Page Application (SPA)** using **React**. This project replicates the core user experience of YouTube, featuring dynamic video rendering, real-time search, and a robust persistence layer using LocalStorage.

## 🚀 All Integrated Features

### 📺 Video Experience

* **Dynamic SPA Routing:** Utilizes hash-based routing (`#/video/:id`) to switch views without page reloads.
* **Video Player Page:** A dedicated view for each video featuring a player placeholder, metadata, and interactive engagement tools.
* **Smart "Up Next" Recommendations:** A sidebar on the video page that dynamically filters the current video out of the list to show related content.
* **Engagement Suite:** * **Interactive Like/Dislike:** Includes toggle logic (liking a video automatically removes a dislike and vice versa).
* **Live Subscriber Count:** Real-time increment/decrement of subscriber counts when the "Subscribe" button is toggled.



### 🔍 Discovery & Navigation

* **Global Search:** Real-time filtering of the video grid based on video titles or author names.
* **Category-Based Filtering:** Filter videos by categories (e.g., "Music", "Gaming") via the sidebar.
* **Personalized "Subscriptions" Feed:** A unique category that dynamically filters the grid to show only videos from authors the user has subscribed to.
* **Collapsible Sidebar:** A responsive hamburger menu that toggles the UI layout using a global body class.

### 💬 Social & Profile Features

* **Persistent Comment System:** Users can post public comments. Comments are stored per video and attributed to the current user's profile name.
* **Advanced Notification System:** * Unread count badge.
* Dropdown menu with unread status tracking.
* Deep-linking: Clicking a notification navigates directly to the relevant video.


* **User Profile Management:** Interactive modal to update Name, Email, Bio, and Avatar, with global state updates across the header and comments.

---

## 🛠️ Tech Stack

* **Core Library:** React.js (Hooks: `useState`, `useEffect`)
* **Routing:** Custom Hash-Routing Logic
* **Data Layer:** Fetch API with `dataset.json`
* **Storage:** Window LocalStorage API (for state persistence)
* **Styling:** Modular CSS3 (Flexbox & CSS Grid)

---

## 📂 Project Structure

```text
├── icons/               # SVG assets (Search, Notifications, Thumb-up, etc.)
├── scripts/
│   └── app.js           # Core React logic, Custom Hooks, and Components
├── styles/
│   ├── general.css      # Layout resets and global body variables
│   ├── header.css       # Navigation bar and search styling
│   ├── sidebar.css      # Sidebar states and link hover effects
│   └── video.css        # Responsive grid and Video Page layouts
├── thumbnails/          # Video preview and channel assets
├── dataset.json         # Mock database for videos and notifications
├── youtube.html         # Main entry point (loads React via CDN)
└── README.md

```

---

## 🚦 Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/youtube-clone.git

```


2. **Run with a Local Server:**
Since the app uses `fetch()` to load `dataset.json`, you must run it through a server (like **Live Server** in VS Code) to avoid CORS policy restrictions.
3. **Persistence:**
Interact with the app! Your likes, subscriptions, and profile changes will remain even after you refresh the page.

---

## 🧠 Logic Breakdown

### State Hydration (`useDataset` Hook)

The app utilizes a custom hook that serves as a mini-Redux. It fetches base data and immediately merges it with `localStorage` to ensure the UI reflects the user's specific history (e.g., read vs. unread notifications).

### Engagement Persistence

All interactions are keyed to the video ID in LocalStorage:

* `like_{id}` / `dislike_{id}`: Boolean flags for engagement.
* `counts_{id}`: Numeric values for engagement totals.
* `comments_{id}`: Array of comment objects.
