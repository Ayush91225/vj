import { useState } from 'react';
import './Tooltip.css';

export const Tooltip = ({ label, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div 
      className="tooltip-container" 
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="tooltip-content">
          {label}
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};
