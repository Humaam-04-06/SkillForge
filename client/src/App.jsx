import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSkillForgeStore } from './store/useSkillForgeStore';
import api from './utils/api';

// Components
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Footer from './components/Layout/Footer';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import JobAnalyzer from './pages/JobAnalyzer';
import GapReport from './pages/GapReport';
import Roadmap from './pages/Roadmap';
import Challenges from './pages/Challenges';
import MentorChat from './pages/MentorChat';
import ResumeGenerator from './pages/ResumeGenerator';
import PublicProfile from './pages/PublicProfile';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import AuthCallback from './pages/AuthCallback';
import NotFound from './pages/NotFound';

function App() {
  const { token, login, logout, isAuthenticated, setUser } = useSkillForgeStore();
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Try to load user profile if token is present
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token, setUser, logout]);

  // Loading state placeholder
  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center text-textPrimary flex-col gap-4">
        <div className="w-12 h-12 rounded-xl border-4 border-accentCyan/30 border-t-accentCyan animate-spin"></div>
        <p className="font-medium text-sm text-textSecondary animate-pulse">Initializing SkillForge session...</p>
      </div>
    );
  }

  // Define routes that shouldn't show the Sidebar
  const isPublicRoute = 
    location.pathname === '/' || 
    location.pathname.startsWith('/u/') || 
    location.pathname === '/auth/callback';

  return (
    <div className="min-h-screen flex flex-col bg-darkBg text-textPrimary">
      <Navbar />

      <div className="flex flex-1 relative">
        {/* Render Sidebar only on authenticated non-public routes */}
        {isAuthenticated && !isPublicRoute && <Sidebar />}

        <main className={`flex-1 flex flex-col min-w-0 ${!isPublicRoute && isAuthenticated ? 'p-6 md:p-8' : 'w-full'}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/u/:username" element={<PublicProfile />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/analyze" 
              element={isAuthenticated ? <Analyze /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/job" 
              element={isAuthenticated ? <JobAnalyzer /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/gap-report" 
              element={isAuthenticated ? <GapReport /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/roadmap" 
              element={isAuthenticated ? <Roadmap /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/challenges" 
              element={isAuthenticated ? <Challenges /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/mentor" 
              element={isAuthenticated ? <MentorChat /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/resume" 
              element={isAuthenticated ? <ResumeGenerator /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/leaderboard" 
              element={isAuthenticated ? <Leaderboard /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />} 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Footer shows on all routes */}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default App;
