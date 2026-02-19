import { SquaresFour, X, User } from 'phosphor-react';
import { NAV_GROUPS } from '../../constants/navigation';
import { SIDEBAR_WIDE, SIDEBAR_SLIM } from '../../constants';
import { Tooltip } from '../ui/Tooltip';
import { NavItem } from './NavItem';
import { useAuthStore } from '../../store';
import './Sidebar.css';

export const Sidebar = ({ 
  slim, 
  isMobile, 
  mobileOpen, 
  setMobileOpen, 
  setCollapsed, 
  activePage, 
  setActivePage,
  devOpen,
  setDevOpen 
}) => {
  const { user } = useAuthStore();

  const SidebarContent = ({ forceExpanded = false }) => {
    const showLabel = forceExpanded || !slim;

    return (
      <>
        <div className={`sidebar-header ${slim ? 'slim' : ''}`}>
          {showLabel && <span className="logo">VajraOpz</span>}
          <div className="header-actions">
            {!isMobile && (
              <button onClick={() => setCollapsed(c => !c)} className="icon-button" title="Toggle sidebar">
                <SquaresFour size={20} weight="regular" />
              </button>
            )}
            {isMobile && forceExpanded && (
              <button onClick={() => setMobileOpen(false)} className="icon-button">
                <X size={22} weight="regular" />
              </button>
            )}
          </div>
        </div>

        <div className="nav-groups">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={`nav-group ${gi === 0 ? 'first' : ''}`}>
              {group.items.map(item => (
                <NavItem 
                  key={item.id} 
                  item={item} 
                  isActive={item.id === activePage}
                  slim={slim}
                  showLabel={showLabel}
                  onClick={() => {
                    setActivePage(item.id);
                    if (isMobile) setMobileOpen(false);
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {showLabel && (
          <div className="vajra-inf-card" onClick={() => {
            setActivePage('vajrainf');
            if (isMobile) setMobileOpen(false);
          }}>
            <div className="vajra-inf-content">
              <h3 className="vajra-inf-title">Try VajraINF</h3>
              <p className="vajra-inf-desc">
                Autonomous ML & LLM training without GPU investment. Pay only for active compute time.
              </p>
              <button className="vajra-inf-btn">Explore MLOps →</button>
            </div>
          </div>
        )}
        
        {slim && (
          <Tooltip label="Try VajraINF - Autonomous MLOps">
            <div className="vajra-inf-card-slim" onClick={() => setActivePage('vajrainf')}>
              <div className="vajra-inf-icon">V</div>
            </div>
          </Tooltip>
        )}

        <div className={`sidebar-footer ${slim ? 'slim' : ''}`}>
          {slim ? (
            <Tooltip label={user?.username || 'User'}>
              <div className="user-avatar">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <User size={18} weight="regular" />
                )}
              </div>
            </Tooltip>
          ) : (
            <>
              <div className="user-avatar">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <User size={18} weight="regular" />
                )}
              </div>
              {showLabel && <span className="user-name">{user?.username || 'User'}</span>}
            </>
          )}
        </div>
      </>
    );
  };

  if (isMobile) {
    return (
      <>
        {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
        <div className={`sidebar mobile ${mobileOpen ? 'open' : ''}`} style={{ width: SIDEBAR_WIDE }}>
          <SidebarContent forceExpanded />
        </div>
      </>
    );
  }

  return (
    <div className="sidebar desktop" style={{ width: slim ? SIDEBAR_SLIM : SIDEBAR_WIDE }}>
      <SidebarContent />
    </div>
  );
};
