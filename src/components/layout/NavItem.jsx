import { memo } from 'react';
import { Tooltip } from '../ui/Tooltip';
import './NavItem.css';

export const NavItem = memo(function NavItem({ item, isActive, slim, showLabel, onClick }) {
  const Icon = item.icon;

  const inner = (
    <button
      className={`nav-item ${isActive ? 'active' : ''} ${slim ? 'slim' : ''}`}
      onClick={onClick}
      aria-label={item.label}
      aria-current={isActive ? 'page' : undefined}
    >
      <span className="nav-icon" aria-hidden="true">
        <Icon size={20} weight="regular" />
      </span>
      {showLabel && <span className="nav-label">{item.label}</span>}
    </button>
  );

  return slim ? <Tooltip label={item.label}>{inner}</Tooltip> : inner;
});
