# 3D Glassmorphic Portfolio Website

A modern, high-performance 3D portfolio website crafted for **Sourava Kumar Swain** — Full-Stack Developer & AI Engineer based in Bhubaneswar, India.

Inspired by and modeled after [sourava-kumar-swain.vercel.app](https://sourava-kumar-swain.vercel.app), elevated with **Three.js 3D WebGL graphics**, **ultra-modern glassmorphism**, **custom magnetic cursor animations**, and **scroll-driven interactions**.

---

## ✨ Features

- **Interactive 3D Hero Section (Three.js WebGL)**:
  - Real-time 3D multifaceted crystal core with ambient reflection.
  - Outer glowing wireframe cage and concentric orbiting gimbal rings.
  - 800+ drifting stardust and galaxy particles.
  - Dynamic cursor lighting: point lights follow mouse coordinates in 3D space, casting dynamic specular highlights across crystal faces.
  - Scroll-linked 3D parallax: the 3D scene rotates and transforms as you scroll down.

- **Glassmorphism Design System**:
  - Translucent frosted glass panels (`backdrop-filter: blur(16px)`).
  - Luminous gradient borders, inner specular highlights, and depth shadows.
  - Ambient glowing background mesh orbs (cyan, purple, and magenta) with smooth drift animations.
  - Interactive 3D tilt cards that react to mouse position with dynamic specular sheen.

- **Custom Magnetic Cursor Animation ("Cursor Animation")**:
  - Dual-layer pointer: snappy center dot and smooth trailing outer glass aura.
  - Magnetic pull effect: buttons subtly attract toward the cursor when hovered.
  - Interactive click ripple explosion.
  - Automatically disabled on touch/mobile devices for optimal usability.

- **Scroll-Triggered Animations**:
  - Top scroll progress bar with cyber gradient.
  - IntersectionObserver scroll reveals (`fade-up`, `fade-right`, `fade-left`, `zoom-in`).
  - Animated number counters for statistics (e.g. `15+` projects, `100%` clean code).
  - Active navigation indicator that synchronizes with scroll position.

- **Comprehensive Sections (Matching Reference Portfolio)**:
  - **Hero Section**: Status pill ("Available to work"), dynamic typewriter effect cycling through roles, call-to-action buttons, 3D tilt photo frame with floating glass chips.
  - **Tech Stack Marquee**: Continuous infinite-scrolling ticker with modern technologies (React, Next.js, Node.js, Python, FastAPI, PyTorch, Docker, Supabase, PostgreSQL, Three.js).
  - **About Section**: Detailed biography, quick facts grid, and highlighted stat metrics.
  - **Skills Section**: Filterable categories (Frontend, Backend, AI & ML, Tools) with animated skill proficiency bars.
  - **Featured Projects**: Star project `CAMPUSLINK 3.0` (AI campus assistant), 3D Glassmorphic Portfolio, Gully Cricket retro music player, Scientific Calculator, and Durga Mata computational sketch.
  - **Journey / Timeline**: Milestones including Software Developer at Ayush Technology, 1st place in BPUT Hackathon, and Python Programming mastery.
  - **Education & Certifications**: B.Tech CSE at Bhubaneswar Engineering College, CHSE Science at UNOPOS Higher Secondary School, and Unstop QuizOff AI Quiz.
  - **Curriculum Vitae (Resume)**: Glassmorphic resume sheet with dedicated **Print / Save as PDF** functionality.
  - **Contact Section**: Interactive form with real-time validation, direct communication links (Email, WhatsApp direct chat), and **Live Bhubaneswar Clock (Asia/Kolkata timezone)** updating in real time.
  - **Theme Switcher**: Instant toggle between Dark Cyber Glass (default) and Light Frost Glass with local storage persistence.

---

## 🚀 How to Run Locally

You can run the portfolio using any standard local HTTP server:

### Option 1: Python
```bash
python -m http.server 8085
```
Open [http://localhost:8085](http://localhost:8085) in your browser.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

---

## 📁 Project Structure

```
portfolio/
├── index.html              # Main HTML5 structure with semantic sections
├── assets/
│   ├── hero.png            # Portrait photo
│   └── logo.png            # Avatar logo
├── css/
│   └── style.css           # Glassmorphism design system & responsive layout
├── js/
│   ├── three-scene.js      # Three.js 3D hero scene, lighting & parallax
│   ├── cursor.js           # Custom fluid magnetic cursor & click ripple
│   └── app.js              # Typewriter, scroll reveals, filters & live clock
└── README.md               # Documentation & setup guide
```

---

## 🌐 Deployment

The project is completely static (no build step required). You can deploy it instantly:
- **Vercel**: Import the GitHub repo or run `vercel` in this folder.
- **GitHub Pages**: Push to GitHub and enable Pages in repository settings.
- **Netlify**: Drag and drop the folder into the Netlify dashboard.

