<div align="center">

# ⚡ NovaFetch

### Fast & Modern Media Downloader

Download videos, audio, and thumbnails from your favourite platforms — all from one sleek interface.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 🎬 What is NovaFetch?

NovaFetch is a self-hosted media downloader with a premium, glassmorphic UI. Paste a link, pick your format, and download — it's that simple. It runs entirely on your machine with a React frontend and an Express backend powered by **yt-dlp**.

### Supported Platforms

| Platform | Videos | Audio | Thumbnails |
| :--- | :---: | :---: | :---: |
| YouTube | ✅ | ✅ | ✅ |
| Instagram | ✅ | ✅ | ✅ |
| TikTok | ✅ | ✅ | ✅ |
| Facebook | ✅ | ✅ | ✅ |
| X / Twitter | ✅ | ✅ | ✅ |

> yt-dlp supports [1000+ sites](https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md), so most video URLs will work out of the box.

---

## ✨ Features

- **🎥 Video Download** — Choose quality (360p / 720p / 1080p) and format (MP4 / WebM).
- **🎵 Audio Extraction** — Extract audio as MP3 at 128 kbps or 320 kbps.
- **🖼️ Thumbnail Grab** — Download the highest-resolution thumbnail with one click.
- **✂️ Trim & Cut** — Set custom start / end timestamps before downloading (requires FFmpeg).
- **📊 Live Progress** — Real-time download progress bar with status indicators.
- **🌗 Dark / Light Theme** — Toggle between themes; your preference is saved locally.
- **🎨 Shader Background** — WebGL-powered animated background for a premium feel.
- **📱 Responsive Design** — Works great on desktop and mobile browsers.
- **🔒 Fully Local** — Everything runs on your machine. No data is sent to third-party servers.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS 4 |
| **Backend** | Express 5 (Node.js), yt-dlp |
| **Media Processing** | FFmpeg (via `ffmpeg-static`) |
| **Animations** | Framer Motion, WebGL Shaders |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |

---

## 📦 Prerequisites

Before you begin, make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** — v18 or newer (LTS recommended)
- **[Git](https://git-scm.com/)** — for cloning the repository

> **Optional:** FFmpeg is bundled via `ffmpeg-static`, so it installs automatically with `npm install`. If you need a system-wide FFmpeg for other tools, you can install it separately, but it is **not required**.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gurjant00/Nova-Fetch.git
cd Nova-Fetch
```

### 2. Install dependencies

```bash
npm install
```

This will install all frontend and backend dependencies, including `yt-dlp` and `ffmpeg-static`.

### 3. Start the development server

```bash
npm run dev
```

This launches **both** the Vite frontend (port `5173`) and the Express API server (port `3001`) concurrently.

### 4. Open in your browser

```
http://localhost:5173
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start both frontend + backend in development mode |
| `npm run dev:fe` | Start only the Vite frontend |
| `npm run dev:be` | Start only the Express backend |
| `npm run build` | Type-check and build production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🗂️ Project Structure

```
Nova-Fetch/
├── public/                  # Static assets (logo, icons)
│   ├── logo.png
│   ├── logo.ico
│   ├── favicon.svg
│   └── icons.svg
├── server/
│   └── index.js             # Express API server (yt-dlp + FFmpeg)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── shader-background.tsx   # WebGL animated background
│   │   ├── Header.tsx                  # App header + theme toggle
│   │   ├── LinkInput.tsx               # URL input + paste + fetch
│   │   ├── VideoPreview.tsx            # Video thumbnail + metadata
│   │   ├── DownloadPanel.tsx           # Download options (tabs, quality, trim)
│   │   └── DownloadProgress.tsx        # Live download progress list
│   ├── api.ts               # Frontend API client
│   ├── types.ts              # TypeScript type definitions
│   ├── utils.ts              # Helper functions (format, detect platform)
│   ├── index.css             # Global styles + design tokens
│   ├── main.tsx              # React entry point
│   └── App.tsx               # Root application component
├── index.html                # HTML entry point
├── vite.config.ts            # Vite + proxy configuration
├── tsconfig.json             # TypeScript config
├── package.json
├── Start NovaFetch.bat       # Windows quick-launch script
└── README.md
```

---

## ⚙️ How It Works

```
┌─────────────┐     POST /api/info      ┌─────────────┐     yt-dlp --dump-json     ┌─────────┐
│   Browser    │ ──────────────────────► │   Express   │ ──────────────────────────► │  yt-dlp │
│  (React UI)  │ ◄────────────────────── │   Server    │ ◄────────────────────────── │         │
│             │     Video metadata       │  :3001      │     JSON metadata           └─────────┘
│             │                          │             │
│             │     POST /api/download   │             │     yt-dlp + FFmpeg
│             │ ──────────────────────► │             │ ──────────────────────────► Download
│             │ ◄────────────────────── │             │     stream file to client     + Merge
│             │     Binary stream        │             │                              + Trim
└─────────────┘                          └─────────────┘
```

1. **Paste a URL** → the frontend sends it to `/api/info`.
2. **Server calls yt-dlp** → extracts title, thumbnail, duration, available qualities.
3. **Choose options** → pick video/audio/thumbnail, quality, format, and optional trim range.
4. **Download** → the server streams the file back to the browser, which triggers a save dialog.

---

## 🖥️ Windows Quick Launch

A convenience batch file (`Start NovaFetch.bat`) is included. Double-click it to:

1. Start the dev servers (`npm run dev`)
2. Wait for services to initialize
3. Open NovaFetch in a clean Edge app window (no address bar / tabs)

> You can edit the batch file to use Chrome or another browser if preferred.

---

## 🔧 Configuration

### Vite Proxy

The Vite dev server proxies `/api/*` requests to the Express backend at `http://localhost:3001`. This is configured in `vite.config.ts`:

```ts
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

### Backend Port

The Express server listens on port **3001** by default. You can change this in `server/index.js`.

### FFmpeg

FFmpeg is resolved in the following order:
1. Bundled `ffmpeg-static` package (installed automatically)
2. System-installed `ffmpeg` (fallback)

Without FFmpeg, NovaFetch can still download videos and audio, but **MP3 conversion** and **trimming** will not be available.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feature/my-feature`
3. **Commit** your changes — `git commit -m "Add my feature"`
4. **Push** to your fork — `git push origin feature/my-feature`
5. **Open** a Pull Request

### Guidelines

- Follow the existing code style (TypeScript, ESLint)
- Keep commits atomic and descriptive
- Test your changes locally before submitting

---


## ⚠️ Disclaimer

NovaFetch is intended for downloading content that you have the right to download. Please respect copyright laws and the terms of service of the platforms you use. The developers are not responsible for any misuse of this tool.

---

<div align="center">

**NovaFetch** — Fast & Modern Media Downloader

Made with ❤️ using React, Vite, and yt-dlp

</div>
