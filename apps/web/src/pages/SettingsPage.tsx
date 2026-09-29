import React, { useState, useRef } from 'react';
import { useAuth } from '../store/AuthContext';
import { useTheme } from '../store/ThemeContext';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import {
  User,
  Sun,
  Moon,
  Monitor,
  Lock,
  Download,
  Upload,
  Camera,
  CheckCircle2,
  Loader2,
  Shield,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security' | 'data'>('profile');

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Export & Import State
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.updateProfile({ name, bio, timezone });
      if (res.success) {
        updateUser(res.user);
        success('Profile updated', 'Your profile changes have been saved.');
      }
    } catch (err: any) {
      toastError(err.message || 'Could not update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await api.uploadAvatar(file);
      if (res.success) {
        updateUser({ avatar: res.avatarUrl });
        success('Avatar updated', 'Your photo has been changed.');
      }
    } catch (err: any) {
      toastError(err.message || 'Avatar upload failed');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toastError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toastError('New password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword, confirmNewPassword });
      success('Password changed', res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumajournal_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Export complete', 'Your journal archive was downloaded.');
    } catch (err) {
      toastError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsImporting(true);
        const json = JSON.parse(event.target?.result as string);
        const res = await api.importData(json);
        success('Import successful', res.message);
      } catch (err: any) {
        toastError(err.message || 'Failed to parse or import data file');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-2 border-b border-border-subtle">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          Settings & Profile
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Manage your personal details, theme preferences, security, and data backups
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border text-sm overflow-x-auto pb-px">
        {[
          { key: 'profile', label: 'Profile', icon: User },
          { key: 'appearance', label: 'Appearance', icon: Sun },
          { key: 'security', label: 'Security', icon: Lock },
          { key: 'data', label: 'Data & Privacy', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-foreground-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-foreground">Public Profile</h2>

          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 text-primary flex items-center justify-center text-2xl font-bold uppercase border-2 border-border">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Upload new avatar"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl border border-border bg-surface-elevated text-xs font-medium hover:bg-surface-elevated/80 transition-colors"
              >
                Change Avatar
              </button>
              <p className="text-[11px] text-foreground-muted mt-1">
                JPG, PNG or GIF up to 5MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated/50 border border-border-subtle text-sm text-foreground-muted cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
              Bio / Personal Mantra
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about yourself or your personal goals..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="UTC">UTC (Universal Time)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Europe/Paris">Europe/Paris (CET)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-soft-sm active:scale-95 flex items-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-foreground">Theme & Interface</h2>
          <p className="text-xs text-foreground-muted -mt-4">
            Select your preferred visual theme. Persisted across sessions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                mode: 'light',
                label: 'Light Mode',
                desc: 'Warm off-white editorial paper',
                icon: Sun,
              },
              {
                mode: 'dark',
                label: 'Dark Mode',
                desc: 'Deep midnight slate and soft violet',
                icon: Moon,
              },
              {
                mode: 'system',
                label: 'System Preference',
                desc: 'Sync automatically with OS theme',
                icon: Monitor,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.mode;
              return (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setTheme(item.mode as any)}
                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-primary bg-primary-50/60 dark:bg-primary-950/40 shadow-soft-sm ring-2 ring-primary/20'
                      : 'border-border bg-surface hover:bg-surface-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-elevated flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground mb-1">
                      {item.label}
                    </h3>
                    <p className="text-xs text-foreground-muted">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-foreground">Update Password</h2>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-700 text-white font-medium text-sm transition-all shadow-soft-sm active:scale-95 flex items-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Data & Privacy Tab */}
      {activeTab === 'data' && (
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-foreground">Data Ownership & Backups</h2>
          <p className="text-xs text-foreground-muted -mt-4">
            You own 100% of your data. Export your entire journal at any time in structured JSON format.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Export */}
            <div className="p-6 rounded-2xl border border-border bg-surface-elevated/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">Export Journal</h3>
                  <p className="text-xs text-foreground-muted">Download all entries, tags, and moods</p>
                </div>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed">
                Create a full offline archive of your thoughts. You can use this for backup or migration to other software.
              </p>

              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-2"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download Archive (.json)</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-6 rounded-2xl border border-border bg-surface-elevated/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">Import Backup</h3>
                  <p className="text-xs text-foreground-muted">Restore entries from a previous JSON export</p>
                </div>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed">
                Upload a valid LumaJournal JSON backup to restore previous reflections into your active library.
              </p>

              <input
                ref={importInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                disabled={isImporting}
                className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface hover:bg-surface-elevated text-xs font-semibold text-foreground transition-colors flex items-center justify-center gap-2"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Upload JSON Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
