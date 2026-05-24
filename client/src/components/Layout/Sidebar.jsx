import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faCodeBranch, 
  faBriefcase, 
  faChartPie, 
  faRoad, 
  faCalendarCheck, 
  faComments, 
  faIdCard, 
  faTrophy, 
  faCog 
} from '@fortawesome/free-solid-svg-icons';

export const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: faTachometerAlt },
    { name: 'Scan Profile', path: '/analyze', icon: faCodeBranch },
    { name: 'Job Analyzer', path: '/job', icon: faBriefcase },
    { name: 'Learning Roadmap', path: '/roadmap', icon: faRoad },
    { name: 'Daily Challenges', path: '/challenges', icon: faCalendarCheck },
    { name: 'AI Mentor Chat', path: '/mentor', icon: faComments },
    { name: 'Resume Builder', path: '/resume', icon: faIdCard },
    { name: 'Leaderboard', path: '/leaderboard', icon: faTrophy },
    { name: 'Settings', path: '/settings', icon: faCog },
  ];

  return (
    <aside className="w-64 border-r border-darkBorder bg-darkBg/60 backdrop-blur-md h-[calc(100vh-73px)] sticky top-[73px] flex flex-col justify-between py-6 px-4 shrink-0 overflow-y-auto hidden md:flex">
      <div className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-accentPurple/10 text-accentCyan border-l-4 border-accentCyan pl-3' 
                  : 'text-textSecondary hover:bg-darkCard/50 hover:text-textPrimary border-l-4 border-transparent'
              }`
            }
          >
            <FontAwesomeIcon icon={item.icon} className="w-5 text-center text-base" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Mini profile stats summary at sidebar footer */}
      <div className="border-t border-darkBorder pt-4 mt-6">
        <p className="text-xxs text-textSecondary uppercase tracking-wider font-semibold px-4 mb-2">Build Stats</p>
        <div className="flex items-center justify-between text-xs text-textSecondary px-4">
          <span>Version</span>
          <span className="font-mono text-accentCyan text-xxs bg-accentCyan/10 px-2 py-0.5 rounded-full">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
