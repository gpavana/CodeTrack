import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  LogOut,
  Save,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty');
      return;
    }

    setProfileSaving(true);
    setProfileError('');
    try {
      const res = await userApi.updateProfile({ fullName: fullName.trim() });
      updateUser(res.data);
      showToast('Profile name updated successfully', 'success');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    setPasswordError('');
    try {
      await userApi.changePassword({
        currentPassword,
        newPassword,
      });

      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="settings-page max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon size={26} className="text-blue-400" /> Account Settings
        </h1>
        <p className="page-subtitle text-slate-400 text-sm mt-0.5">
          Manage your personal profile and account credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="card">
          <div className="card-header pb-3 border-b border-slate-800 flex items-center gap-2">
            <User size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">Profile Details</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="card-body p-5 space-y-4">
            {profileError && (
              <div className="alert alert-error text-xs">
                <AlertCircle size={14} />
                <span>{profileError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setProfileError('');
                }}
                disabled={profileSaving}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address (Read-only)
              </label>
              <input
                id="email"
                type="email"
                className="form-input bg-slate-900 text-slate-400 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Email is unique and serves as your login credential.
              </span>
            </div>

            <div className="text-xs text-slate-500 pt-1">
              Member since: {formatDate(user?.createdAt)}
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary w-full" disabled={profileSaving}>
                <Save size={16} />
                {profileSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="card-header pb-3 border-b border-slate-800 flex items-center gap-2">
            <Lock size={18} className="text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="card-body p-5 space-y-4">
            {passwordError && (
              <div className="alert alert-error text-xs">
                <AlertCircle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError('');
                  }}
                  disabled={passwordSaving}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  className="form-input pr-10"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError('');
                  }}
                  disabled={passwordSaving}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError('');
                }}
                disabled={passwordSaving}
                required
              />
            </div>

            <div className="pt-2">
              <button type="submit" className="btn btn-primary w-full" disabled={passwordSaving}>
                <ShieldCheck size={16} />
                {passwordSaving ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone / Logout */}
      <div className="card p-5 border-rose-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-rose-300">Account Session</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Log out of your current session on this device.
            </p>
          </div>
          <button type="button" className="btn btn-danger" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out of CodeTrack
          </button>
        </div>
      </div>
    </div>
  );
};
