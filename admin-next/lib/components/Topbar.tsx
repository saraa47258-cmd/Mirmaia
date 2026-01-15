'use client';

import { getCurrentUser } from '../auth';
import { Bell, Search, Settings } from 'lucide-react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const user = getCurrentUser();

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Title */}
      <div>
        {title && (
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '40px',
          padding: '0 14px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          cursor: 'pointer',
        }}>
          <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>بحث...</span>
        </div>

        {/* Settings */}
        <button style={{
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          color: '#64748b',
        }}>
          <Settings style={{ width: '20px', height: '20px' }} />
        </button>

        {/* Notifications */}
        <button style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '10px',
          cursor: 'pointer',
          color: '#64748b',
        }}>
          <Bell style={{ width: '20px', height: '20px' }} />
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid #ffffff',
          }}></span>
        </button>

        {/* Profile */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          cursor: 'pointer',
        }}>
          {user?.name.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
}
