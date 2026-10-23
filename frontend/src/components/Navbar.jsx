import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User as UserIcon, Code2, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully', 'info');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/dashboard" className="navbar-brand">
          <div className="brand-logo-badge">
            <Code2 size={22} className="text-blue-400" />
          </div>
          <span className="brand-name">
            Code<span className="brand-name-accent">Track</span>
          </span>
          <span className="brand-tag">v1.0</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="relative">
          <button
            type="button"
            className="user-profile-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
          >
            <div className="user-avatar">{getInitials(user?.fullName)}</div>
            <div className="user-info-text hidden md:block">
              <span className="user-name">{user?.fullName || 'Developer'}</span>
              <span className="user-email">{user?.email || 'user@codetrack.com'}</span>
            </div>
            <ChevronDown size={16} className="text-slate-400 ml-1" />
          </button>

          {dropdownOpen && (
            <>
              <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <div className="font-medium text-slate-200">{user?.fullName}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                </div>
                <div className="dropdown-divider" />
                <Link
                  to="/settings"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <UserIcon size={16} />
                  <span>Account Settings</span>
                </Link>
                <button
                  type="button"
                  className="dropdown-item text-rose-400 hover:text-rose-300"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
