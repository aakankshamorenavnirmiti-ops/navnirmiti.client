import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LockClosedIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../utils/api';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  const handleChange = e => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
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

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));

        switch (data.data.role) {
          case 'student':
            localStorage.setItem('studentFirstLogin', 'true');
            setSuccess(true);
            navigate('/student-dashboard');
            break;
          case 'client':
            setSuccess(true);
            navigate('/client-dashboard');
            break;
          case 'admin':
            setError('Admin accounts must log in via the Admin Portal.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setLoading(false);
            break;
          default:
            setSuccess(true);
            navigate('/');
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">

          <div>
            <div className="mx-auto h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center">
              <AcademicCapIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Student Login</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access your training portal
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm text-center font-medium">
              ✓ Login successful — redirecting…
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email" name="email" type="email" required disabled={success}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Email address"
                  value={credentials.email} onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password" name="password" type="password" required disabled={success}
                  autoComplete="current-password"
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="Password"
                  value={credentials.password} onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
              </div>
              <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-500 bg-transparent border-0 p-0 cursor-pointer">
                Forgot your password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LockClosedIcon className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
              </span>
              {success ? '✓ Logged in' : loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="text-center space-y-2">
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">New student?</p>
              <Link
                to="/register/student"
                className="inline-block w-full py-3 px-6 border-2 font-semibold rounded-full text-sm transition"
                style={{ borderColor: '#450a0a', color: '#450a0a' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#450a0a'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#450a0a'; }}
              >
                Register Here →
              </Link>
            </div>
            <p className="text-xs text-gray-400">
              Are you a client?{' '}
              <Link to="/client-login" className="text-primary-600 hover:text-primary-500 font-medium">
                Go to Client Portal →
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
