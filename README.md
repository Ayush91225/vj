# VajraOpz

Enterprise-level React application with Zustand state management and production-ready architecture.

## 🏗️ Project Structure

```
VajraOpz/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, Header, NavItem)
│   │   ├── pages/           # Page components (TTSPage, BillingPage, ComingSoon)
│   │   ├── ui/              # Reusable UI components (Tooltip, Select)
│   │   └── common/          # Common components (ErrorBoundary)
│   ├── store/               # Zustand state management
│   │   ├── useUIStore.js
│   │   ├── useProjectStore.js
│   │   ├── useAuthStore.js
│   │   └── index.js
│   ├── services/            # API services
│   │   └── api.js
│   ├── hooks/               # Custom React hooks
│   │   ├── useResponsive.js
│   │   └── useClickOutside.js
│   ├── utils/               # Utility functions
│   │   └── helpers.js
│   ├── config/              # Configuration
│   │   └── env.js
│   ├── constants/           # App constants and configuration
│   │   ├── index.js
│   │   └── navigation.js
│   ├── App.jsx              # Main App component
│   ├── App.css              # Global styles
│   └── main.jsx             # Entry point
├── .env.development         # Development environment
├── .env.example             # Environment template
├── index.html
├── vite.config.js
├── package.json
├── PRODUCTION.md            # Production deployment guide
└── README.md
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
npm run build:prod
```

### Preview Production Build
```bash
npm run preview
```

## 🎯 State Management (Zustand)

### UI Store
Manages sidebar, search, and UI preferences with localStorage persistence.

```javascript
import { useUIStore } from './store';

const { sidebarCollapsed, toggleSidebar, searchQuery, setSearchQuery } = useUIStore();
```

### Project Store
Manages project data with CRUD operations.

```javascript
import { useProjectStore } from './store';

const { projects, selectedProject, setSelectedProject, fetchProjects } = useProjectStore();
```

### Auth Store
Manages authentication state with persistence.

```javascript
import { useAuthStore } from './store';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

## 🎨 Design System

### Fonts
- **Headings**: Season Mix (Sans Serif)
- **Body Text**: Matter (Sans Serif)

### Icons
- **Library**: Phosphor Icons
- Clean, modern icon set with consistent styling

## 📦 Key Features

- ✅ **Zustand State Management** - Lightweight, performant global state
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Lazy Loading** - Code splitting for optimal performance
- ✅ **Environment Configuration** - Separate dev/prod configs
- ✅ **API Service Layer** - Centralized API management
- ✅ **Modular Architecture** - Clean separation of concerns
- ✅ **Custom Hooks** - Reusable logic
- ✅ **Responsive Design** - Mobile & desktop optimized
- ✅ **Production Optimized** - Bundle splitting and tree shaking

## 🛠️ Tech Stack

- React 18
- Zustand (State Management)
- React Router v7
- Vite (Build tool)
- Phosphor Icons
- Recharts
- CSS Modules

## 📚 Documentation

See [PRODUCTION.md](./PRODUCTION.md) for detailed production deployment guide.
