import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import logo from '../image/logo.png';
import { API_BASE_URL } from '../utils/api';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.data.role === 'admin') {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data));
        navigate('/admin-portal');
      } else if (response.ok && data.data.role !== 'admin') {
        setError('Access denied. Only admin accounts are allowed here.');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1a0505 0%, #450a0a 40%, #6b1414 70%, #1a0505 100%)',
      }}
    >
      <div className="w-full max-w-md mx-4">
        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.97)' }}
        >
          {/* Top accent bar */}
          <div
            className="h-1.5 w-full"
            style={{ background: 'linear-gradient(to right, #450a0a, #c0392b, #450a0a)' }}
          />

          <div className="px-10 py-10">
            {/* Logo + title */}
            <div className="flex flex-col items-center mb-8">
              <img src={logo} alt="Nav Nirmiti" className="h-20 w-auto object-contain mb-4" />
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheckIcon className="h-6 w-6 text-red-800" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Restricted access — authorised personnel only
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@navnirmiti.com"
                  value={credentials.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm transition"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 text-sm transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-semibold text-sm transition duration-300 disabled:opacity-60"
                style={{ background: loading ? '#7a3535' : '#450a0a' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#6b1414'; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#450a0a'; }}
              >
                <LockClosedIcon className="h-4 w-4" />
                {loading ? 'Authenticating...' : 'Sign in to Admin Portal'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <Link
                to="/login"
                className="text-sm text-gray-400 hover:text-gray-600 transition"
              >
                ← Back to main login
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} Nav Nirmiti Constructions
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
