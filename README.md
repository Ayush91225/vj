# VajraOpz

Enterprise-level React application with a clean, modular architecture.

## 🏗️ Project Structure

```
VajraOpz/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, Header, NavItem)
│   │   ├── pages/           # Page components (TTSPage, BillingPage, ComingSoon)
│   │   └── ui/              # Reusable UI components (Tooltip, Select)
│   ├── hooks/               # Custom React hooks
│   │   ├── useResponsive.js
│   │   └── useClickOutside.js
│   ├── utils/               # Utility functions
│   │   └── helpers.js
│   ├── constants/           # App constants and configuration
│   │   ├── index.js
│   │   └── navigation.js
│   ├── App.jsx              # Main App component
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🎨 Design System

### Fonts
- **Headings**: Season Mix (Sans Serif)
- **Body Text**: Matter (Sans Serif)

### Icons
- **Library**: Phosphor Icons
- Clean, modern icon set with consistent styling

## 📦 Key Features

- ✅ Modular component architecture
- ✅ Custom hooks for reusable logic
- ✅ Responsive design (mobile & desktop)
- ✅ Collapsible sidebar
- ✅ Clean separation of concerns
- ✅ Enterprise-level code organization

## 🛠️ Tech Stack

- React 18
- Vite (Build tool)
- Phosphor Icons
- CSS Modules
