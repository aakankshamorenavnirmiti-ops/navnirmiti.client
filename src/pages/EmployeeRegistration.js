import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BriefcaseIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './PageHero.css';
import { API_BASE_URL } from '../utils/api';

const PasswordInput = ({ name, value, onChange, placeholder, hasError }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || '••••••••'}
        autoComplete="new-password"
        className={`w-full px-4 py-3 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 pr-11 ${
          hasError ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 bg-white'
        }`}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
};

const EmployeeRegistration = () => {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', sector: '',
    services: '', city: '', district: '', state: '',
    password: '', confirmPassword: '',
  });
  const [errors,      setErrors]      = useState({});
  const [status,      setStatus]      = useState(null);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Full name is required';
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.phone.trim())    e.phone    = 'Phone number is required';
    if (!form.sector.trim())   e.sector   = 'Sector is required';
    if (!form.services.trim()) e.services = 'Services offered is required';
    if (!form.city.trim())     e.city     = 'City is required';
    if (!form.state.trim())    e.state    = 'State is required';
    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStatus('submitting');
    setServerError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:         form.name,
          email:        form.email,
          password:     form.password,
          role:         'employee',
          mobileNumber: form.phone,
          sector:       form.sector,
          services:     form.services,
          city:         form.city,
          district:     form.district,
          state:        form.state,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setServerError(data.error || 'Registration failed. Please try again.');
        setStatus('error');
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const inputCls = field =>
    `w-full px-4 py-3 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
      errors[field] ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 bg-white'
    }`;

  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-20 px-4">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-10">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful!</h2>
            <p className="text-gray-600 mb-2">Your employee account has been created.</p>
            <p className="text-gray-500 mb-8 text-sm">
              Log in with <strong>{form.email}</strong> and your chosen password.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-full transition">
                Sign In Now →
              </Link>
              <Link to="/careers" className="inline-block border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-full transition">
                Back to Careers
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-4 text-center page-hero-content">
          <h1 className="page-hero-title">Employee Registration</h1>
          <p className="page-hero-sub">
            Register as an employee partner and join the Nav Nirmiti professional network.
          </p>
        </div>
      </section>

      <main className="flex-grow bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10">

            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <BriefcaseIcon className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Employee Partner Registration</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create your account — fields marked <span className="text-red-500">*</span> are required
                </p>
              </div>
            </div>

            {status === 'error' && (
              <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} className={inputCls('name')} placeholder="Your full name" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls('email')} placeholder="your@email.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputCls('phone')} placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sector <span className="text-red-500">*</span></label>
                  <input name="sector" value={form.sector} onChange={handleChange} className={inputCls('sector')} placeholder="e.g. Civil Engineering" />
                  {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Services Offered <span className="text-red-500">*</span></label>
                  <input name="services" value={form.services} onChange={handleChange} className={inputCls('services')} placeholder="e.g. Plumbing, Masonry, Waterproofing" />
                  {errors.services && <p className="text-red-500 text-xs mt-1">{errors.services}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input name="city" value={form.city} onChange={handleChange} className={inputCls('city')} placeholder="Your city" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">District</label>
                  <input name="district" value={form.district} onChange={handleChange} className={inputCls('district')} placeholder="Optional" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State <span className="text-red-500">*</span></label>
                  <input name="state" value={form.state} onChange={handleChange} className={inputCls('state')} placeholder="Your state" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Password block */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Create Your Login Password</p>
                  <p className="text-xs text-gray-500">Use these credentials to sign in to your employee dashboard.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                    <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" hasError={!!errors.password} />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                    <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" hasError={!!errors.confirmPassword} />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" disabled={status === 'submitting'}
                  className="w-full py-3.5 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition duration-300 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
                  {status === 'submitting'
                    ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Creating account…</>
                    : 'Register as Employee Partner'}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in here</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EmployeeRegistration;
