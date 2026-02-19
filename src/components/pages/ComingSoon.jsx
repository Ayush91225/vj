import { useState, useEffect } from 'react';
import { Skeleton } from '../ui/Skeleton';
import './ComingSoon.css';

export const ComingSoon = ({ label }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="coming-soon">
        <Skeleton width="300px" height="32px" borderRadius="8px" />
        <Skeleton width="400px" height="20px" borderRadius="6px" />
      </div>
    );
  }

  return (
    <div className="coming-soon">
      <div className="coming-soon-title">{label}</div>
      <div className="coming-soon-desc">This page is under construction</div>
    </div>
  );
};
