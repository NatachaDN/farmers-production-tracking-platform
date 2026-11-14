import React from 'react';
import './Skeleton.css';

export function Skeleton({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`acrea-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function SkeletonText({ lines = 2, gap = '8px', className = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, width: '100%' }} className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ height = '140px', style = {}, children }) {
  return (
    <div
      className="acrea-skeleton-card"
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        ...style
      }}
    >
      {children}
    </div>
  );
}

