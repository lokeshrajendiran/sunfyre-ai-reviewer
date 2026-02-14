import React from 'react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return <div>Not authenticated</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1>Settings</h1>
      <div style={{ marginBottom: 24 }}>
        <h3>Profile</h3>
        <p><strong>Username:</strong> {user.username}</p>
        {user.email && <p><strong>Email:</strong> {user.email}</p>}
        {user.profile?.profileUrl && (
          <p><a href={user.profile.profileUrl} target="_blank" rel="noopener noreferrer">GitHub Profile</a></p>
        )}
      </div>
      <button onClick={logout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
};
