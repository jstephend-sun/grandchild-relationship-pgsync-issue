import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const loc = useLocation();
  const active = loc.pathname === to || (to === '/' && loc.pathname === '/');
  return (
    <Link
      to={to}
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        textDecoration: 'none',
        color: active ? '#fff' : '#111',
        background: active ? '#111' : 'transparent',
        border: '1px solid #111',
        marginRight: 8
      }}
    >
      {children}
    </Link>
  );
};

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, borderBottom: '1px solid #ddd' }}>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/create-course">Create Course</NavLink>
        <NavLink to="/create-student">Create Student</NavLink>
      </nav>
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
