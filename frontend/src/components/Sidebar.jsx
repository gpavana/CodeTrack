import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  PlusCircle,
  CalendarCheck,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/problems', label: 'Problems', icon: Code2 },
  { path: '/problems/new', label: 'Add Problem', icon: PlusCircle },
  { path: '/revisions', label: 'Revision Center', icon: CalendarCheck },
  { path: '/topics', label: 'Topics & Progress', icon: BookOpen },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, isCollapsed, onToggleCollapse, onCloseMobile }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-mobile-backdrop" onClick={onCloseMobile} />}

      <aside
        className={`sidebar ${isOpen ? 'sidebar-open' : ''} ${
          isCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <div className="sidebar-header">
          {!isCollapsed && <span className="sidebar-title">NAVIGATION</span>}
          <button
            type="button"
            className="sidebar-collapse-toggle hidden md:flex"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/problems' ? false : true}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                onClick={onCloseMobile}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={20} className="sidebar-icon flex-shrink-0" />
                {!isCollapsed && <span className="sidebar-label">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-card">
              <div className="text-xs font-semibold text-blue-400 mb-1">PRO TIP</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Spaced intervals (1, 3, 7, 21 days) reinforce pattern recall for interview success.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
