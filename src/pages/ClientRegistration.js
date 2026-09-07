import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UserIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon,
  CameraIcon, ArrowLeftIcon, ArrowRightIcon, PhotoIcon,
} from '@heroicons/react/24/outline';
import './PageHero.css';
import qrImage from '../image/QR.jpeg';
import { API_BASE_URL } from '../utils/api';

const PasswordInput = ({ name, value, onChange, placeholder, hasError }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange}
        placeholder={placeholder || '••••••••'} autoComplete="new-password"
        className={`w-full px-4 py-3 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 pr-11 ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
};

const STEPS = ['Details', 'Payment', 'Submit'];

const ClientRegistration = () => {
  const photoRef    = useRef(null);
  const paymentRef  = useRef(null);

  const [step, setStep] = useState(0); // 0 = form, 1 = QR/payment, 2 = done
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', password: '', confirmPassword: ''
  });
  const [profilePhoto,       setProfilePhoto]       = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [paymentScreenshot,  setPaymentScreenshot]  = useState(null);
  const [paymentPreview,     setPaymentPreview]     = useState(null);
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())   e.name   = 'Full name is required';
    if (!form.email.trim())  e.email  = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone.trim())  e.phone  = 'Phone number is required';
    if (!form.password)      e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min. 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const handleProfilePhoto = e => {
    const f = e.target.files[0];
    if (!f) return;
    setProfilePhoto(f);
    setProfilePhotoPreview(URL.createObjectURL(f));
  };

  const handlePaymentScreenshot = e => {
    const f = e.target.files[0];
    if (!f) return;
    setPaymentScreenshot(f);
    setPaymentPreview(URL.createObjectURL(f));
  };

  /* Step 1 → Step 2: validate details first */
  const handleNextToPayment = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Step 2 → Final submit */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!paymentScreenshot) {
      setServerError('Please upload a screenshot of your payment before submitting.');
      return;
    }
    setSubmitting(true);
    setServerError('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== 'confirmPassword') fd.append(k, v); });
    if (profilePhoto)      fd.append('profilePhoto',      profilePhoto);
    if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);

    try {
      const res  = await fetch(`${API_BASE_URL}/clients/register`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setServerError(data.error || 'Registration failed.');
      }
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ic = field =>
    `w-full px-4 py-3 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`;

  /* ── STEP 2: Success ── */
  if (step === 2) {
    return (
      <div className="min-h-screen flex flex-col">
        <section className="page-hero">
          <div className="page-hero-overlay" />
          <div className="container mx-auto px-6 text-center page-hero-content">
            <h1 className="page-hero-title">Registration Submitted</h1>
          </div>
        </section>
        <main className="flex-grow flex items-center justify-center bg-gray-50 py-20 px-4">
          <div className="max-w-lg w-full text-center bg-white rounded-2xl shadow-xl p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Received!</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-left">
              <p className="text-amber-800 text-sm leading-relaxed font-medium">
                📋 You can access your account with the same password once the admin approves your entry.
                You will receive an email confirmation once your account is activated.
              </p>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              We've notified our team and will review your registration shortly.
              Thank you for choosing Nav Nirmiti Constructions.
            </p>
            <Link to="/client-login"
              className="inline-block text-white font-bold py-3 px-8 rounded-full transition shadow-md"
              style={{ background: '#450a0a' }}>
              Go to Client Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  /* ── STEP 1: Payment QR ── */
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col">
        <section className="page-hero">
          <div className="page-hero-overlay" />
          <div className="container mx-auto px-6 text-center page-hero-content">
            <h1 className="page-hero-title">Complete Payment</h1>
            <p className="page-hero-sub">Scan the QR code to pay, then upload your screenshot below.</p>
          </div>
        </section>

        <main className="flex-grow bg-gray-50 py-12">
          <div className="container mx-auto px-4">

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-0 mb-10 max-w-sm mx-auto">
              {STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                      i < step ? 'bg-green-500 border-green-500 text-white' :
                      i === step ? 'border-primary-600 bg-primary-600 text-white' :
                      'border-gray-300 bg-white text-gray-400'}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</p>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8">

                {/* QR code */}
                <div className="text-center mb-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Scan to Pay</h3>
                  <p className="text-sm text-gray-500 mb-5">Use any UPI app — Google Pay, PhonePe, Paytm, etc.</p>
                  <div className="inline-block p-3 bg-gray-900 rounded-2xl shadow-lg">
                    <img
                      src={qrImage}
                      alt="Payment QR — Aakanksha More (UPI)"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <p className="text-white text-sm mt-2 bg-gray-800 inline-block px-3 py-1 rounded-full">
                    Aakanksha More — Scan to pay with any UPI app
                  </p>
                </div>

                {/* Upload screenshot */}
                <div className="border-t border-gray-100 pt-6">
                  <p className="text-sm font-bold text-gray-800 mb-1">Upload Payment Screenshot <span className="text-red-500">*</span></p>
                  <p className="text-xs text-gray-500 mb-4">After completing the payment, take a screenshot and upload it here.</p>

                  {paymentPreview ? (
                    <div className="relative mb-4">
                      <img src={paymentPreview} alt="Payment proof" className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                      <button type="button" onClick={() => { setPaymentScreenshot(null); setPaymentPreview(null); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow">×</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition mb-4"
                      onClick={() => paymentRef.current?.click()}>
                      <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload payment screenshot</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG accepted</p>
                    </label>
                  )}
                  <input ref={paymentRef} type="file" accept="image/*" className="hidden" onChange={handlePaymentScreenshot} />

                  {serverError && (
                    <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">{serverError}</div>
                  )}

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStep(0); setServerError(''); }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-full hover:bg-gray-50 transition text-sm">
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting || !paymentScreenshot}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-white font-bold rounded-full transition text-sm disabled:opacity-50"
                      style={{ background: '#450a0a' }}>
                      {submitting
                        ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Submitting…</>
                        : <>Submit <ArrowRightIcon className="h-4 w-4" /></>}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── STEP 0: Registration Form ── */
  return (
    <div className="min-h-screen flex flex-col">
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-6 text-center page-hero-content">
          <h1 className="page-hero-title">Client Registration</h1>
          <p className="page-hero-sub">Create your account to track your project with Nav Nirmiti Constructions.</p>
        </div>
      </section>

      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 mb-10 max-w-sm mx-auto">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition ${
                    i < step ? 'bg-green-500 border-green-500 text-white' :
                    i === step ? 'border-primary-600 bg-primary-600 text-white' :
                    'border-gray-300 bg-white text-gray-400'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${i === step ? 'text-primary-700' : 'text-gray-400'}`}>{s}</p>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-7 w-7 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Fields marked <span className="text-red-500">*</span> are required</p>
              </div>
            </div>

            <form onSubmit={handleNextToPayment} noValidate>
              {/* Profile photo */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center cursor-pointer ring-4 ring-white shadow-md relative"
                     onClick={() => photoRef.current?.click()}>
                  {profilePhotoPreview
                    ? <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    : <UserIcon className="h-10 w-10 text-primary-400" />
                  }
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition rounded-full">
                    <CameraIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  {profilePhotoPreview ? 'Change photo' : 'Upload profile photo (optional)'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                  <input name="name" value={form.name} onChange={handleChange} className={ic('name')} placeholder="Your full name" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={ic('email')} placeholder="your@email.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={ic('phone')} placeholder="+91 98765 43210" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
                  <textarea name="address" value={form.address} onChange={handleChange} rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your site / project address (optional)" />
                </div>
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

              <div className="pt-6">
                <button type="submit"
                  className="w-full py-3.5 text-white font-bold rounded-full transition flex items-center justify-center gap-2 text-sm"
                  style={{ background: '#450a0a' }}>
                  Next: Proceed to Payment <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/client-login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in here</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientRegistration;
