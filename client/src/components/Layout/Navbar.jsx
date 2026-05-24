import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faSun, faMoon, faSignOutAlt, faCog, faUser } from '@fortawesome/free-solid-svg-icons';
import { useSkillForgeStore } from '../../store/useSkillForgeStore';
import { Button } from '../UI/Button';

export const Navbar = () => {
  const { user, token, isAuthenticated, logout, theme, setTheme } = useSkillForgeStore();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-darkBorder bg-darkBg/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      {/* Brand */}
      <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-accentPurple to-accentCyan flex items-center justify-center text-white shadow-md shadow-accentCyan/20 group-hover:scale-105 transition-transform duration-300">
          <FontAwesomeIcon icon={faHammer} className="text-lg" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-textPrimary via-accentCyan to-accentPurple bg-clip-text text-transparent tracking-tight">
          SkillForge
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-lg flex items-center justify-center border border-darkBorder bg-darkCard/50 text-textSecondary hover:text-textPrimary transition-all duration-300 hover:border-accentCyan/30"
          aria-label="Toggle Theme"
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
        </button>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            {/* User Details */}
            <Link 
              to={`/u/${user?.username}`}
              className="flex items-center gap-2 group p-1.5 rounded-lg border border-transparent hover:border-darkBorder hover:bg-darkCard/40 transition-all duration-300"
            >
              <img
                src={user?.avatarUrl || 'https://via.placeholder.com/150'}
                alt={user?.displayName || 'User Avatar'}
                className="w-8 h-8 rounded-full border border-accentCyan/20 group-hover:border-accentCyan/50 transition-colors"
              />
              <span className="hidden sm:inline text-sm font-medium text-textPrimary group-hover:text-accentCyan transition-colors">
                {user?.displayName || user?.username}
              </span>
            </Link>

            {/* Logout Icon */}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-lg flex items-center justify-center border border-darkBorder bg-darkCard/50 text-red-400 hover:text-red-300 transition-all duration-300 hover:border-red-500/20"
              title="Logout"
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/github`}
          >
            Sign In with GitHub
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
