import { useState, useRef } from 'react';
import { CaretDown } from 'phosphor-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import './Select.css';

export const Select = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="select-container">
      <button onClick={() => setOpen(o => !o)} className="select-button">
        <span className="select-value">
          {value === "Bulbul V3" && <span className="model-indicator" />}
          {value}
        </span>
        <CaretDown size={14} weight="bold" />
      </button>
      {open && (
        <div className="select-dropdown">
          {options.map(option => (
            <div
              key={option}
              onClick={() => { onChange(option); setOpen(false); }}
              className={`select-option ${option === value ? 'active' : ''}`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
