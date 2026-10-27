'use client';

import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// NOTE: In a production app, credential validation would happen on the server.
// Here we validate against env vars that are embedded at build time on the server
// via a /api/admin-auth endpoint so the password is never shipped in client JS.
export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        // Store session token in sessionStorage (cleared on tab close)
        sessionStorage.setItem('sokonova_admin_token', data.token);
        onSuccess();
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Owner Admin Portal</h2>
          <p className="text-zinc-400 text-sm">Restricted access — SokoNova owners only</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@sokonova.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-zinc-200 focus:border-orange-500 focus:outline-none text-sm transition bg-zinc-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-zinc-200 focus:border-orange-500 focus:outline-none text-sm transition bg-zinc-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-black text-sm transition shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Access Admin Dashboard
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 text-zinc-500 hover:text-zinc-700 text-sm font-semibold transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
