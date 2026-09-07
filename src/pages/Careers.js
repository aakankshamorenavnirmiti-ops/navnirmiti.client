import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon, LightBulbIcon, ArrowTrendingUpIcon,
  AcademicCapIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon,
  BriefcaseIcon, MapPinIcon, ClockIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import './PageHero.css';
import { API_BASE_URL } from '../utils/api';

const ic = (err) =>
  `w-full px-4 py-3.5 border rounded-xl text-base transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
    err ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 bg-white'
  }`;

const PasswordInput = ({ name, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange}
        placeholder={placeholder || '••••••••'} className={ic(error) + ' pr-12'} autoComplete="new-password" />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
};

/* ════════ STUDENT FORM ════════ */
const StudentForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: '', email: '', mobileNumber: '', collegeName: '',
    city: '', district: '', state: '', courseName: '', rollNumber: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())         e.name         = 'Full name is required';
    if (!form.email.trim())        e.email        = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    if (!form.collegeName.trim())  e.collegeName  = 'College name is required';
    if (!form.courseName.trim())   e.courseName   = 'Course name is required';
    if (!form.rollNumber.trim())   e.rollNumber   = 'Roll number is required';
    if (!form.city.trim())         e.city         = 'City is required';
    if (!form.state.trim())        e.state        = 'State is required';
    if (!form.password)            e.password     = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min. 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true); setServerError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, password: form.password, role: 'student',
          mobileNumber: form.mobileNumber, collegeName: form.collegeName,
          city: form.city, district: form.district, state: form.state,
          courseName: form.courseName, rollNumber: form.rollNumber,
        }),
      });
      const data = await res.json();
      if (data.success) { onSuccess('student', form.name, form.email); }
      else { setServerError(data.error || 'Registration failed.'); }
    } catch { setServerError('Network error.'); }
    finally { setSubmitting(false); }
  };

  const Field = ({ label, name, type = 'text', placeholder, span2 = false, required = true }) => (
    <div className={span2 ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} name={name} value={form[name]} onChange={set}
        placeholder={placeholder} className={ic(errors[name])} />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && <div className="mb-6 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{serverError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <Field label="Full Name" name="name" placeholder="Your full name" />
        <Field label="Email Address" name="email" type="email" placeholder="your@email.com" />
        <Field label="Mobile Number" name="mobileNumber" type="tel" placeholder="+91 98765 43210" />
        <Field label="College / University" name="collegeName" placeholder="Name of your institution" />
        <Field label="Course Name" name="courseName" placeholder="e.g. B.E. Civil Engineering" />
        <Field label="Roll / Registration No" name="rollNumber" placeholder="College roll number" />
        <Field label="City" name="city" placeholder="Your city" />
        <Field label="District" name="district" placeholder="Your district" required={false} />
        <Field label="State" name="state" placeholder="Your state" span2 />
      </div>
      <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">🔒 Create Your Login Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <PasswordInput name="password" value={form.password} onChange={set} placeholder="Min. 6 characters" error={errors.password} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
            <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={set} placeholder="Re-enter" error={errors.confirmPassword} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>
      <div className="text-center">
        <button type="submit" disabled={submitting}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-12 rounded-full transition shadow-lg text-lg disabled:opacity-60 inline-flex items-center gap-3">
          {submitting ? <><span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />Creating account…</> : 'Register for Student Program'}
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Already registered? <Link to="/login" className="text-primary-600 font-semibold">Sign in →</Link>
        </p>
      </div>
    </form>
  );
};

/* ════════ SUCCESS ════════ */
const SuccessScreen = ({ name, email, onReset }) => (
  <div className="text-center py-10 px-4">
    <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
    <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome, {name}!</h2>
    <p className="text-gray-600 text-lg mb-2">Your student account has been created successfully.</p>
    <p className="text-gray-500 mb-8">Log in using <strong>{email}</strong> and your password.</p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link to="/login" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-10 rounded-full transition shadow-lg text-lg">Sign In Now →</Link>
      <button onClick={onReset} className="inline-block border-2 border-gray-300 text-gray-600 font-semibold py-4 px-10 rounded-full transition text-lg">Register Another</button>
    </div>
  </div>
);

/* ════════ JOB CARD ════════ */
const typeColors = {
  'full-time':  'bg-blue-100 text-blue-700',
  'part-time':  'bg-amber-100 text-amber-700',
  'internship': 'bg-green-100 text-green-700',
  'contract':   'bg-purple-100 text-purple-700',
};

const JobCard = ({ job }) => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition duration-300 flex flex-col">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{job.department}</p>
      </div>
      <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize flex-shrink-0 ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
        {job.type.replace('-', ' ')}
      </span>
    </div>
    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
      <span className="flex items-center gap-1.5"><MapPinIcon className="h-4 w-4 text-gray-400" />{job.location}</span>
      <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4 text-gray-400" />
        {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    </div>
    <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">{job.description}</p>
    <a href="#register-section"
      className="self-start inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold text-sm rounded-full transition"
      style={{ background: '#450a0a' }}
      onMouseEnter={e => e.currentTarget.style.background = '#5e0e0e'}
      onMouseLeave={e => e.currentTarget.style.background = '#450a0a'}>
      Apply Now <ArrowRightIcon className="h-4 w-4" />
    </a>
  </div>
);

/* ════════ CAREERS PAGE ════════ */
const Careers = () => {
  const [successInfo, setSuccessInfo] = useState(null);
  const [jobs,        setJobs]        = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs`)
      .then(r => r.json())
      .then(d => setJobs(d.data || []))
      .catch(console.error)
      .finally(() => setJobsLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'active');

  const benefits = [
    { icon: <UserGroupIcon className="h-12 w-12 text-primary-600" />, title: 'Team Environment', description: 'Work in a collaborative environment with experienced construction professionals.' },
    { icon: <LightBulbIcon className="h-12 w-12 text-primary-600" />, title: 'Growth Opportunities', description: 'Continuous learning and career advancement at every stage of your journey.' },
    { icon: <ArrowTrendingUpIcon className="h-12 w-12 text-primary-600" />, title: 'Project Diversity', description: 'Gain hands-on experience across residential, commercial, and infrastructure projects.' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-6 text-center page-hero-content">
          <h1 className="page-hero-title">Careers at Nav Nirmiti</h1>
          <p className="page-hero-sub">Join our team of professionals and help us build the future of construction.</p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-5">Why Work With Us?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-14">We offer a dynamic work environment where you can grow your career and make a meaningful impact.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl shadow-md border border-gray-100 text-center hover:shadow-xl transition">
                <div className="flex justify-center mb-6">{b.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{b.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOB OPENINGS ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <BriefcaseIcon className="h-4 w-4" /> Current Openings
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Job Openings</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">We're looking for talented individuals to join our growing team.</p>
          </div>

          {jobsLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600" />
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl max-w-2xl mx-auto">
              <BriefcaseIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No openings right now</h3>
              <p className="text-gray-400">Check back soon — we post new roles regularly. You can still register as a student below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {activeJobs.map(job => <JobCard key={job._id} job={job} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── STUDENT REGISTRATION ── */}
      <section id="register-section" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-5">Student Program</h2>
              <p className="text-xl text-gray-600">Register to create your student account and join the Nav Nirmiti training program.</p>
            </div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-primary-600 px-8 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <AcademicCapIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Student Registration</h3>
                  <p className="text-white/80 text-sm mt-0.5">Create your account — login access provided immediately.</p>
                </div>
              </div>
              <div className="p-8 md:p-10">
                {successInfo
                  ? <SuccessScreen name={successInfo.name} email={successInfo.email} onReset={() => setSuccessInfo(null)} />
                  : <StudentForm onSuccess={(r, name, email) => setSuccessInfo({ role: r, name, email })} />
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
