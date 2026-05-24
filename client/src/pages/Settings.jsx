import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, 
  faKey, 
  faEye, 
  faEyeSlash, 
  faSun, 
  faMoon, 
  faTrash, 
  faExclamationTriangle,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import api from '../utils/api';
import { useSkillForgeStore } from '../store/useSkillForgeStore';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';

export const Settings = () => {
  const { user, setUser, theme, setTheme, apiKey, setApiKey, logout } = useSkillForgeStore();
  const navigate = useNavigate();

  // Local form states
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isPublic, setIsPublic] = useState(user ? user.isPublic : true);
  
  // Loaders
  const [keySaving, setKeySaving] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [themeSaving, setThemeSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setKeySaving(true);
    try {
      const response = await api.patch('/api/settings/api-key', {
        apiKey: localApiKey
      });
      if (response.data) {
        setApiKey(localApiKey);
        alert('🎉 Gemini API Key successfully saved.');
      }
    } catch (err) {
      console.error('Failed to update API key:', err);
      alert('Failed to save API key.');
    } finally {
      setKeySaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setPrivacySaving(true);
    try {
      const response = await api.patch('/api/profile/privacy', {
        isPublic
      });
      if (response.data) {
        const updatedUser = { ...user, isPublic };
        setUser(updatedUser);
        alert('🎉 Privacy configurations updated.');
      }
    } catch (err) {
      console.error('Failed to update privacy settings:', err);
      alert('Failed to update visibility.');
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleSaveTheme = async (selectedTheme) => {
    setThemeSaving(true);
    try {
      const response = await api.patch('/api/settings/theme', {
        theme: selectedTheme
      });
      if (response.data) {
        setTheme(selectedTheme);
        const updatedUser = { ...user, theme: selectedTheme };
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to update theme database:', err);
      // local theme toggle fallback anyway
      setTheme(selectedTheme);
    } finally {
      setThemeSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      alert('Please type "delete" to confirm account eradication.');
      return;
    }

    setDeleting(true);
    try {
      const response = await api.delete('/api/settings/account');
      if (response.data) {
        alert(response.data.message || 'Account successfully deleted.');
        setIsDeleteModalOpen(false);
        logout();
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
      alert('An error occurred during account deletion.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Configuration Settings</h1>
        <p className="text-xs text-textSecondary mt-0.5">Manage credentials, theme settings, privacy levels, and credentials logs</p>
      </div>

      {/* Gemini API Key manager (BYOK) */}
      <Card 
        title="Gemini API Key Manager (BYOK)" 
        subtitle="Bring Your Own Key: Enter a Google Gemini API Key. Keys are never saved permanently on the server and are proxy-passed securely."
      >
        <form onSubmit={handleSaveApiKey} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="apiKey" className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
              <FontAwesomeIcon icon={faKey} /> Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 bg-darkBg border border-darkBorder rounded-lg text-xs font-mono text-textPrimary placeholder:text-textSecondary/40 focus:outline-none focus:border-accentCyan transition-colors"
            />
            <p className="text-[10px] text-textSecondary leading-normal">
              Need a key? Retrieve a free tier API Key from the{' '}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-accentCyan hover:underline font-semibold"
              >
                Google AI Studio
              </a>
              .
            </p>
          </div>
          <div className="pt-2 border-t border-darkBorder/40 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={keySaving}
              icon={<FontAwesomeIcon icon={faSave} />}
            >
              Save API Key
            </Button>
          </div>
        </form>
      </Card>

      {/* Privacy and Theme controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Visibility */}
        <Card 
          title="Recruiter Visibility" 
          subtitle="Manage public access to profile metrics"
        >
          <div className="space-y-5">
            <label className="flex items-start gap-3.5 p-3 rounded-lg border border-darkBorder bg-darkCard/25 cursor-pointer hover:bg-darkCard/50 duration-300">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-0.5 text-accentCyan focus:ring-accentCyan bg-darkBg border-darkBorder rounded"
              />
              <div>
                <h4 className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
                  <FontAwesomeIcon icon={isPublic ? faEye : faEyeSlash} className="text-xxs text-accentCyan" />
                  Enable Public Recruiter URL
                </h4>
                <p className="text-[10px] text-textSecondary mt-0.5 leading-relaxed">
                  Allows recruiters to view your verified skills radar and roadmap progression without logging in.
                </p>
              </div>
            </label>

            <div className="pt-2 border-t border-darkBorder/40 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSavePrivacy}
                isLoading={privacySaving}
                icon={<FontAwesomeIcon icon={faSave} />}
              >
                Save Privacy Settings
              </Button>
            </div>
          </div>
        </Card>

        {/* Theme customization */}
        <Card 
          title="Interface Customization" 
          subtitle="Choose application styling theme"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSaveTheme('dark')}
                disabled={themeSaving}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 font-semibold transition-all duration-300 ${
                  theme === 'dark'
                    ? 'border-accentCyan bg-accentPurple/10 text-accentCyan'
                    : 'border-darkBorder bg-darkCard/30 text-textSecondary hover:text-textPrimary hover:bg-darkCard/50'
                }`}
              >
                <FontAwesomeIcon icon={faMoon} className="text-lg" />
                <span className="text-xs">Dark Theme</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveTheme('light')}
                disabled={themeSaving}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 font-semibold transition-all duration-300 ${
                  theme === 'light'
                    ? 'border-accentPurple bg-accentPurple/10 text-accentPurple'
                    : 'border-darkBorder bg-darkCard/30 text-textSecondary hover:text-textPrimary hover:bg-darkCard/50'
                }`}
              >
                <FontAwesomeIcon icon={faSun} className="text-lg" />
                <span className="text-xs">Light Theme</span>
              </button>
            </div>
            <p className="text-[10px] text-textSecondary text-center">Configured theme logs are synced to local states.</p>
          </div>
        </Card>
      </div>

      {/* Danger Zone: GDPR Cleanup */}
      <Card 
        title="Danger Zone" 
        subtitle="Irreversible account deletion actions"
        className="border-red-500/20 bg-red-500/[0.02]"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-dangerRed" />
              Delete SkillForge Account
            </h4>
            <p className="text-[10px] text-textSecondary max-w-lg leading-relaxed">
              Permanently erases user records, matching history logs, challenges resolved maps, and generated roadmap accordion checkpoints from our servers. This action is absolute.
            </p>
          </div>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<FontAwesomeIcon icon={faTrash} />}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* GDPR Account Deletion Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Permanently Delete Account"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-dangerRed rounded-lg text-xs leading-relaxed flex gap-3 items-start">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-base mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Are you absolutely sure?</p>
              <p className="mt-0.5 text-textSecondary">
                This deletes all data connected with your GitHub account from SkillForge. Your roadmaps and streaks will be lost forever.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-delete" className="text-xxs font-bold uppercase text-textSecondary">
              Type <strong className="text-textPrimary">delete</strong> to confirm:
            </label>
            <input
              id="confirm-delete"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full px-3 py-2 bg-darkBg border border-darkBorder rounded-lg text-xs font-bold focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-3 border-t border-darkBorder flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.toLowerCase() !== 'delete'}
              isLoading={deleting}
            >
              Confirm Account Eradication
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
