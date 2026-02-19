import { List, Gift, Plus, MagnifyingGlass } from 'phosphor-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PAGE_META } from '../../constants';
import './Header.css';

export const Header = ({ activePage, isMobile, setMobileOpen, searchQuery, setSearchQuery }) => {
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
          <button onClick={() => setMobileOpen(true)} className="menu-button">
            <List size={20} weight="regular" />
          </button>
          <span className="mobile-logo">VajraOpz</span>
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
                <MagnifyingGlass size={16} weight="regular" />
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  className="search-input" 
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery?.(e.target.value)}
                />
              </div>
              <button className="action-button primary" onClick={() => navigate('/add')}>
                <Plus size={14} weight="bold" /> New Project
              </button>
            </>
          )}
          {activePage === "deploy" && !isDeployWithId && (
            <div className="search-bar">
              <MagnifyingGlass size={16} weight="regular" />
              <input 
                type="text" 
                placeholder={isDeployWithProject ? "Search deployments..." : "Search projects..."}
                className="search-input" 
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery?.(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
