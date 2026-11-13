import React, { useEffect, useRef, useState } from 'react';
import { IconChevronDown, IconCamera, IconSettings, IconLogout, IconUser } from './Icons';
import { authService } from '../../features/auth/services/authService';

export function TopBar({
  title = 'Dashboard', subtitle, userName = '', userInitials = '', avatarUrl = null,
  farmName = '', onLogout, onUserUpdate, onEditProfile, onOpenNavigation, navigationOpen = false
}) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const headerSubtitle = subtitle ?? [today, farmName].filter(Boolean).join(' · ');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const account = useRef(null);
  const trigger = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const closeOutside = event => {
      if (!account.current?.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [dropdownOpen]);

  const closeMenu = () => {
    setDropdownOpen(false);
    trigger.current?.focus();
  };

  const handleFileChange = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      onUserUpdate?.(await authService.uploadAvatar(file));
    } catch (error) {
      setUploadError(error.message || 'Failed to upload profile picture.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <header className="acrea-topbar">
      <button type="button" className="navigation-toggle" aria-label="Open navigation"
        aria-expanded={navigationOpen} aria-controls="mobile-navigation" onClick={onOpenNavigation}>
        <span aria-hidden="true" />
      </button>
      <div className="topbar-heading">
        <h1>{title}</h1>
        {headerSubtitle && <p>{headerSubtitle}</p>}
      </div>
      <div className="topbar-account" ref={account}
        onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setDropdownOpen(false); }}
        onKeyDown={event => { if (dropdownOpen && event.key === 'Escape') { event.stopPropagation(); closeMenu(); } }}>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
          hidden onChange={handleFileChange} />
        <button id="profile-dropdown-trigger" ref={trigger} type="button" className="topbar-profile"
          aria-label="Account menu" aria-expanded={dropdownOpen} aria-controls="profile-dropdown"
          onClick={() => setDropdownOpen(open => !open)}>
          <span className="topbar-avatar" aria-hidden="true">
            {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : userInitials || <IconUser size={17} />}
          </span>
          <span className="topbar-user-name">
            <strong>{userName || 'Account'}</strong>
            {farmName && <small>{farmName}</small>}
          </span>
          <span className="topbar-chevron" aria-hidden="true"><IconChevronDown size={14} /></span>
        </button>
        <div id="profile-dropdown" className="topbar-dropdown" hidden={!dropdownOpen}>
          <div className="topbar-account-name"><strong>{userName || 'Account'}</strong>{farmName && <small>{farmName}</small>}</div>
          <button id="upload-avatar-btn" type="button" disabled={uploading}
            onClick={() => { closeMenu(); fileInput.current?.click(); }}>
            <IconCamera size={17} /> Change profile photo
          </button>
          {onEditProfile && <button id="topbar-edit-profile-btn" type="button"
            onClick={() => { closeMenu(); onEditProfile(); }}><IconSettings size={17} /> Edit profile</button>}
          {onLogout && <button type="button" className="topbar-sign-out"
            onClick={() => { closeMenu(); onLogout(); }}><IconLogout size={17} /> Sign out</button>}
          {dropdownOpen && uploading && <p className="topbar-feedback" role="status">Uploading profile photo…</p>}
          {dropdownOpen && uploadError && <p className="topbar-feedback" role="alert">{uploadError}</p>}
        </div>
        {!dropdownOpen && uploading && <p className="topbar-feedback" role="status">Uploading profile photo…</p>}
        {!dropdownOpen && uploadError && <p className="topbar-feedback" role="alert">{uploadError}</p>}
      </div>
    </header>
  );
}
