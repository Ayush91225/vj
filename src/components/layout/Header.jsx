import { List, MagnifyingGlass, Plus } from 'phosphor-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { memo } from 'react';
import { PAGE_META } from '../../constants';
import './Header.css';

export const Header = memo(function Header({ activePage, isMobile, setMobileOpen, searchQuery, setSearchQuery, onMobileReposOpen }) {
  const { title, sub } = PAGE_META[activePage] || { title: "", sub: "" };
  const navigate = useNavigate();
  const location = useLocation();
  const isDeployWithProject = location.pathname.startsWith('/deploy/') && location.pathname !== '/deploy';
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isDeployWithId = pathSegments.length === 3 && pathSegments[0] === 'deploy';

  return (
    <>
      {isMobile && (
        <div className="mobile-topbar">
          <button 
            onClick={() => setMobileOpen(true)} 
            className="menu-button"
            aria-label="Open navigation menu"
          >
            <List size={20} weight="regular" />
          </button>
          <span className="mobile-logo">VajraOpz</span>
          {activePage === "add" && onMobileReposOpen && (
            <button 
              onClick={onMobileReposOpen} 
              className="menu-button"
              aria-label="Browse GitHub repositories"
            >
              <List size={20} weight="regular" />
            </button>
          )}
        </div>
      )}

      <div className="page-header">
        <div className="header-info">
          <h1 className="page-title">{title}</h1>
          {sub && <p className="page-subtitle">{sub}</p>}
        </div>
        <div className="header-actions">
          {activePage === "project" && (
            <>
              <div className="search-bar">
                <MagnifyingGlass size={16} weight="regular" aria-hidden="true" />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  className="search-input" 
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery?.(e.target.value)}
                  aria-label="Search projects"
                />
              </div>
              <button 
                className="action-button primary" 
                onClick={() => navigate('/add')}
                aria-label="Create new project"
              >
                <Plus size={14} weight="bold" /> New Project
              </button>
            </>
          )}
          {activePage === "deploy" && !isDeployWithId && (
            <div className="search-bar">
              <MagnifyingGlass size={16} weight="regular" aria-hidden="true" />
              <input 
                type="text" 
                placeholder={isDeployWithProject ? "Search deployments..." : "Search projects..."}
                className="search-input" 
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery?.(e.target.value)}
                aria-label={isDeployWithProject ? "Search deployments" : "Search projects"}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
});
