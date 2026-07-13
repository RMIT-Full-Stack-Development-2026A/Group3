import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthUser } from '../../../app/store/authStore';
import Dock from '../ui/dock/Dock';

const BottomDock = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthUser();
  
  const isActive = (path) => location.pathname === path;

  let items = [];

  // Admin Navigation
  if (user?.role === 'ADMIN') {
    items = [
      {
        icon: <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin') ? "'FILL' 1" : "''" }}>home</span>,
        label: 'Dashboard',
        onClick: () => navigate('/admin'),
        isActive: isActive('/admin'),
        className: isActive('/admin') ? 'text-primary' : 'text-on-surface/70 hover:text-primary'
      },
      {
        icon: <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin/users') ? "'FILL' 1" : "''" }}>group</span>,
        label: 'Users',
        onClick: () => navigate('/admin/users'),
        isActive: isActive('/admin/users'),
        className: isActive('/admin/users') ? 'text-primary' : 'text-on-surface/70 hover:text-primary'
      },
      {
        icon: <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/admin/rooms') ? "'FILL' 1" : "''" }}>grid_view</span>,
        label: 'Rooms',
        onClick: () => navigate('/admin/rooms'),
        isActive: isActive('/admin/rooms'),
        className: isActive('/admin/rooms') ? 'text-primary' : 'text-on-surface/70 hover:text-primary'
      }
    ];
  } else {
    // Player Navigation
    items = [
      {
        icon: <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/dashboard') ? "'FILL' 1" : "''" }}>play_arrow</span>,
        label: 'Play',
        onClick: () => navigate('/dashboard'),
        isActive: isActive('/dashboard'),
        className: isActive('/dashboard') ? 'text-primary' : 'text-on-surface/70 hover:text-primary'
      },
      {
        icon: <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/match-history') ? "'FILL' 1" : "''" }}>history</span>,
        label: 'History',
        onClick: () => navigate('/match-history'),
        isActive: isActive('/match-history'),
        className: isActive('/match-history') ? 'text-primary' : 'text-on-surface/70 hover:text-primary'
      },
      {
        icon: <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/profile') ? "'FILL' 1" : "''" }}>person</span>,
        label: 'Profile',
        onClick: () => navigate('/profile'),
        isActive: isActive('/profile'),
        className: isActive('/profile') ? 'text-primary' : 'text-on-surface/70 hover:text-primary'
      }
    ];
  }

  return (
    <Dock 
      items={items}
      panelHeight={60}
      baseItemSize={44}
      magnification={60}
    />
  );
};

export default BottomDock;
