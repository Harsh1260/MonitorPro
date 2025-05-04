# Real-Time Monitoring Dashboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC)

A professional-grade real-time monitoring dashboard built as a single-page application using Next.js, TypeScript, and Tailwind CSS. This application provides comprehensive system monitoring with dynamic updates, interactive visualizations, and customizable alerts.

---

## Live Demo

You can access the deployed version of the MonitorPro here:
**[Live on Vercel](https://monitor-pro-tawny.vercel.app/)**

## 🚀 Features

- ⚡️ Real-time metric simulation with visual alerts
- 📈 Interactive charts with Recharts (line, bar, area)
- 🎛️ Status indicators (Green: Normal, Yellow: Warning, Red: Critical)
- 🔔 Alert notifications with timestamps, priority levels, and actions
- 🎨 Light/Dark mode theming with smooth transitions (via framer-motion)
- 📂 Modular widgets with expand, customize, and threshold settings
- 🧭 Intuitive top navbar with branding, user profile, and global controls
- 📑 Sidebar for seamless single-page navigation
- 🧰 Settings modal for user preferences and layout configurations
- 💡 Tooltips, contextual menus, and smooth interactions
- 📱 Fully responsive for all devices

---
## 🧱 Tech Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS (exclusively)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Avatars**: [randomuser.me](https://randomuser.me/)
- **Images**: [Unsplash](https://unsplash.com/)

---

## 📂 Project Structure

All code is contained within a single `.tsx` file as per constraints. Key sections include:

- `Navbar`: Branding, profile, global actions
- `Sidebar`: SPA navigation
- `Main`: Grid layout of interactive widgets
- `Modals`: Settings, customization, and alerts
- `Charts`: Line/Bar/Area visualizations
- `Theming`: Light/Dark toggle and persistence
- `Animations`: Subtle transitions using Framer Motion

---

## 🧠 Functional Highlights

- **SPA Design**: No page reloads, all interactions are modal or dynamic
- **Threshold Controls**: Customize alert triggers
- **Time Filters**: Change data visualization time ranges
- **Notification Panel**: Acknowledge or dismiss alerts
- **Fully Responsive**: Optimized layouts for mobile, tablet, and desktop
  
---

## 🔧 Getting Started

```bash
git clone https://github.com/Harsh1260/MonitorPro.git
cd MonitorPro
npm install
npm run dev
```

---
