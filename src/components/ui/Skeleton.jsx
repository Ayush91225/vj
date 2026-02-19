import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius = '8px', className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};
