import { Tooltip } from '../ui/Tooltip';
import './NavItem.css';

export const NavItem = ({ item, isActive, slim, showLabel, onClick }) => {
  const Icon = item.icon;

  const inner = (
    <div className={`nav-item ${isActive ? 'active' : ''} ${slim ? 'slim' : ''}`} onClick={onClick}>
      <span className="nav-icon">
        <Icon size={20} weight="regular" />
      </span>
      {showLabel && <span className="nav-label">{item.label}</span>}
    </div>
  );

  return slim ? <Tooltip label={item.label}>{inner}</Tooltip> : inner;
};
