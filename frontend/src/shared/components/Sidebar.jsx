import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export function Sidebar() {
  return (
    <aside className="acrea-sidebar">
      {/* Brand Logo & Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-container">
          <svg className="brand-logo-icon" viewBox="0 0 40 40" fill="none">
            {/* Acrea Stylized 'A' with leaf and furrowed fields */}
            <path
              d="M18 4L6 34h7l3.5-9h10l1.5 4h6.5L24 4h-6z"
              fill="var(--color-forest-green)"
            />
            {/* Curving green leaf */}
            <path
              d="M8 24C10 14 18 8 26 6C23 15 15 26 8 24Z"
              fill="var(--color-leaf-green)"
            />
            {/* Golden ochre field rows */}
            <path
              d="M16 28c3 0 7 2 9 6h-6c-1-2-2-3-3-6z"
              fill="var(--color-ochre)"
            />
            <path
              d="M21 27c3 0 6 2 8 7h-5c-1-2-2-4-3-7z"
              fill="var(--color-ochre)"
            />
          </svg>
          <div className="brand-text">
            <span className="brand-title">Acrea</span>
            <span className="brand-tagline">THRIVING FARM</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/crops"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🌱</span>
          <span className="nav-label">Crops</span>
        </NavLink>

        <NavLink
          to="/crops/cycles/1/activities"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-label">Cycle Activities</span>
        </NavLink>

        <NavLink
          to="/livestock"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">🐄</span>
          <span className="nav-label">Livestock</span>
        </NavLink>

        <NavLink
          to="/production"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-label">Production</span>
        </NavLink>

        <NavLink
          to="/records"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📑</span>
          <span className="nav-label">Records</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">📉</span>
          <span className="nav-label">Reports</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>

      {/* Sidebar Footer / User Profile snippet */}
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">AM</div>
          <div className="user-info">
            <div className="user-name">Alex Martin</div>
            <div className="user-role">Farm Owner #1</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
