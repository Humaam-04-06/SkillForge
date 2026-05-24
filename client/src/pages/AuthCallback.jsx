import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import api from '../utils/api';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useSkillForgeStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setErrorMsg('Authentication token missing. Please try signing in again.');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Temporarily set token in local storage for Axios request interceptor to pick it up
        localStorage.setItem('skillforge_token', token);

        // Fetch authenticated user profile
        const response = await api.get('/api/auth/me');
        
        if (response.data && response.data.user) {
          // Login and store in Zustand state
          login(token, response.data.user);
          
          // Redirect to Dashboard
          navigate('/dashboard');
        } else {
          throw new Error('User profile empty.');
        }
      } catch (err) {
        console.error('Authentication callback error:', err);
        localStorage.removeItem('skillforge_token');
        setErrorMsg('Failed to verify session details. Redirecting to home...');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processToken();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-[70vh] bg-darkBg flex flex-col items-center justify-center text-textPrimary px-6">
      <div className="w-12 h-12 rounded-xl border-4 border-accentPurple/30 border-t-accentPurple animate-spin mb-6"></div>
      
      {errorMsg ? (
        <p className="text-dangerRed font-medium text-center">{errorMsg}</p>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-1 tracking-tight">Completing Authentication</h2>
          <p className="text-sm text-textSecondary">Securing session and syncing profile data...</p>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
