import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Calendar as CalendarIcon,
  BarChart3,
  Star,
  Archive,
  Settings,
  LogOut,
  Plus,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { useSocket } from '../store/SocketContext';
import { SearchDialog } from '../components/ui/SearchDialog';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Journal', path: '/entries', icon: BookOpen },
    { label: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { label: 'Insights', path: '/insights', icon: BarChart3 },
    { label: 'Favorites', path: '/favorites', icon: Star },
    { label: 'Archive', path: '/archive', icon: Archive },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Search Dialog */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-border p-5 shrink-0 justify-between h-screen sticky top-0 overflow-y-auto">
        <div>
          {/* Brand Logo & Name */}
          <NavLink to="/dashboard" className="flex items-center gap-3 mb-8 px-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-400 flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-foreground tracking-tight block">
                LumaJournal
              </span>
              <span className="text-[11px] text-foreground-muted block -mt-0.5">
                Personal Reflection
              </span>
            </div>
          </NavLink>

          {/* New Entry CTA */}
          <button
            onClick={() => navigate('/entries/new')}
            className="w-full mb-6 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-700 text-primary-foreground font-medium text-sm transition-all shadow-soft-sm hover:shadow-soft-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary font-semibold'
                      : 'text-foreground-muted hover:text-foreground hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="pt-4 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                }`}
                title={isConnected ? 'Real-time WebSocket connected' : 'Connecting to real-time service...'}
              />
              <span className="text-[11px] text-foreground-subtle">
                {isConnected ? 'Live sync' : 'Offline sync'}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors"
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-surface-elevated">
            <NavLink to="/settings" className="flex items-center gap-2.5 min-w-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary flex items-center justify-center text-xs font-bold uppercase shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="min-w-0 text-left">
                <span className="text-xs font-semibold text-foreground block truncate">
                  {user?.name}
                </span>
                <span className="text-[10px] text-foreground-muted block truncate">
                  {user?.email}
                </span>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-1.5 text-foreground-subtle hover:text-rose-600 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground md:hidden"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Global Search Bar Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border-subtle text-foreground-muted text-xs transition-colors w-44 sm:w-64"
            >
              <Search className="w-3.5 h-3.5 text-foreground-subtle" />
              <span className="truncate">Search memories...</span>
              <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-subtle">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Realtime Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-elevated border border-border-subtle text-foreground-subtle">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Synced</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-zinc-400" />
                  <span className="text-[11px]">Connecting...</span>
                </>
              )}
            </div>

            {/* Dark mode button for mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground md:hidden"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile New reflection button */}
            <button
              onClick={() => navigate('/entries/new')}
              className="md:hidden p-2 rounded-xl bg-primary text-white"
              title="New Reflection"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface p-4 space-y-2 animate-slide-up">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-950/60 text-primary font-semibold'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="text-xs text-foreground-muted">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-500 font-medium py-1 px-2"
              >
                Log out
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
