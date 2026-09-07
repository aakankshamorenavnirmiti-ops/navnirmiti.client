import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, CheckCircleIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../image/logo.png';
import { API_BASE_URL } from '../utils/api';

/* ══════════════════════ WELCOME POPUP ══════════════════════ */
const ClientWelcomeModal = ({ name, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,2,2,0.72)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl w-full overflow-hidden"
        style={{ maxWidth: '560px' }}
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ opacity: 0, scale: 0.94, y: 10 }}
      >
        {/* Brand accent bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #450a0a, #c0392b, #450a0a)' }} />

        <div className="px-8 py-8">
          {/* Animated checkmark */}
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.15, type: 'spring', stiffness: 260, damping: 18 } }}
          >
            <CheckSolid className="h-11 w-11 text-green-500" />
          </motion.div>

          {/* Greeting in accent font */}
          <p className="text-center mb-2 text-primary-700"
             style={{ fontFamily: 'var(--font-accent)', fontSize: '1.1rem', lineHeight: 1.5 }}>
            Welcome to our organization!
          </p>

          <h2 className="text-center font-bold text-gray-900 mb-5"
              style={{ fontFamily: 'var(--font-primary)', fontSize: 'clamp(1.3rem, 3vw, 1.65rem)', lineHeight: 1.2 }}>
            Hello, {name}!
          </h2>

          {/* Message body */}
          <div className="text-gray-700 leading-relaxed text-left rounded-2xl p-5 mb-6"
               style={{ background: '#fdf8f8', border: '1px solid #f0e0e0', fontSize: '0.96rem', fontFamily: 'var(--font-primary)' }}>
            <p className="mb-3">
              We're <strong>delighted</strong> to have you associated with us. Your onboarding has been successfully
              completed, and we look forward to building a strong and successful partnership with you.
            </p>
           
          </div>

          {/* Signature card */}
          <div className="rounded-2xl px-6 py-5 mb-6 text-left"
               style={{ background: '#1a0505' }}>
            <p className="font-bold text-white" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.1 }}>
              Er. Aakanksha More
            </p>
            <p className="text-gray-300" style={{ fontSize: '0.82rem', margin: '2px 0 6px', lineHeight: 1.3 }}>
              Head – Business Operations &amp; Training Coordinator
            </p>
            <div className="border-t border-white/10 pt-3 mt-1">
              <p className="font-bold text-white" style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.1 }}>
                Er. Ramchandra More
              </p>
              <p className="text-gray-300" style={{ fontSize: '0.82rem', margin: '2px 0 8px', lineHeight: 1.3 }}>
                Founder &amp; Owner
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-1" style={{ fontSize: '0.75rem' }}>
              <a href="tel:+919370773736" className="text-gray-400 hover:text-white transition flex items-center gap-1">
                <PhoneIcon className="h-3 w-3" /> +91 93707 73736
              </a>
              <a href="mailto:aakankshamore.navnirmiti@gmail.com" className="text-gray-400 hover:text-white transition flex items-center gap-1">
                <EnvelopeIcon className="h-3 w-3" /> aakankshamore.navnirmiti@gmail.com
              </a>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full py-4 text-white font-bold rounded-full text-base transition shadow-lg"
            style={{ background: '#450a0a', fontFamily: 'var(--font-primary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5e0e0e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#450a0a')}
          >
            Begin My Journey →
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

/* ══════════════════════ CLIENT LOGIN ══════════════════════ */
const ClientLogin = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [error,       setError]       = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [clientName,  setClientName]  = useState('');
  const navigate = useNavigate();

  const handleChange = e => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.data.role !== 'client') {
          setError('This portal is for clients only. Please use the correct login page.');
          setLoading(false); return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        setSuccess(true);
        setClientName(data.data.name);

        // Show welcome popup on first login only
        const firstLogin = localStorage.getItem(`clientFirstLogin_${data.data._id}`);
        if (!firstLogin) {
          localStorage.setItem(`clientFirstLogin_${data.data._id}`, 'true');
          setShowWelcome(true);
        } else {
          navigate('/client-dashboard');
        }
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    navigate('/client-dashboard');
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #450a0a, #c0392b, #450a0a)' }} />
              <div className="px-8 py-8">

                <div className="text-center mb-7">
                  <img src={logo} alt="Nav Nirmiti" className="h-14 w-auto object-contain mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900">Client Portal</h2>
                  <p className="text-sm text-gray-500 mt-1">Sign in to track your project</p>
                </div>

                {error && (
                  <div className="mb-5 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}
                {success && !showWelcome && (
                  <div className="mb-5 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm text-center font-medium">
                    ✓ Login successful — redirecting…
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input type="email" name="email" value={credentials.email} onChange={handleChange}
                      required disabled={success}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                      placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <input type="password" name="password" value={credentials.password} onChange={handleChange}
                      required disabled={success} autoComplete="current-password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                      placeholder="••••••••" />
                  </div>

                  <button type="submit" disabled={loading || success}
                    className="w-full py-3.5 text-white font-bold rounded-xl text-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: '#450a0a' }}>
                    <LockClosedIcon className="h-4 w-4" />
                    {success ? '✓ Logged in' : loading ? 'Signing in…' : 'Sign in to Client Portal'}
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register/client" className="text-primary-600 hover:text-primary-700 font-semibold">Register here →</Link>
                  </p>
                  <p className="text-xs text-gray-400">
                    Not a client?{' '}
                    <Link to="/login" className="text-gray-500 hover:text-gray-700">Student Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showWelcome && <ClientWelcomeModal name={clientName} onClose={handleWelcomeClose} />}
    </>
  );
};

export default ClientLogin;
