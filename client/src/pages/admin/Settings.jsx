import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_CLASS_TEACHER } from '../../constants/auth';

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, showToggle, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon size={16} style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: '#000000', pointerEvents: 'none', zIndex: 1,
        }} />
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="brutal-input"
        style={{
          paddingLeft: Icon ? '42px' : '14px',
          paddingRight: showToggle ? '40px' : '14px',
        }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          style={{
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
            color: '#000000',
          }}
        >
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const { updatePassword, profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      toast.success('Password changed successfully!', { icon: '🔑' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
          Manage your account credentials and passwords
        </p>
      </div>

      <div className="brutal-card" style={{ padding: '28px 24px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '8px', border: '2px solid #000000',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '2px 2px 0px 0px #000000',
          }}>
            <Shield size={18} color="#000000" />
          </div>
          <div>
            <p style={{ fontWeight: '800', fontSize: '16px', margin: 0, fontFamily: 'var(--font-sketch)' }}>Security Settings</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, fontWeight: '600' }}>
              Logged in as: {profile?.email || DEFAULT_CLASS_TEACHER.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '6px', fontFamily: 'var(--font-sketch)' }}>
              New Password
            </label>
            <InputField
              icon={Key}
              type={showPw ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              showToggle
              onToggle={() => setShowPw(p => !p)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', marginBottom: '6px', fontFamily: 'var(--font-sketch)' }}>
              Confirm New Password
            </label>
            <InputField
              icon={Key}
              type={showPw ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '8px' }}>
            <button
              type="submit"
              disabled={loading}
              className="brutal-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Changing Password...' : 'Update Password 🔑'}
            </button>
          </div>
        </form>
      </div>

      <div className="brutal-card" style={{
        marginTop: '16px', padding: '14px 18px', background: '#E2FBE9',
        display: 'flex', alignItems: 'center', gap: '10px'
      }}>
        <CheckCircle size={16} color="#000000" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#000000', fontFamily: 'var(--font-sketch)', lineHeight: 1.4 }}>
          Security tip: Choose a strong password that you do not use on other platforms.
        </span>
      </div>
    </div>
  );
}
