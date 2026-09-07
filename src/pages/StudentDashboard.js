import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon, ClipboardDocumentListIcon, UserIcon,
  ArrowRightOnRectangleIcon, CheckCircleIcon, ClockIcon,
  BookOpenIcon, PlayIcon, ChevronRightIcon, ChevronLeftIcon,
  PhoneIcon, EnvelopeIcon, TrophyIcon,
  DocumentCheckIcon, XCircleIcon, StarIcon,
  CameraIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../utils/api';
import { fileUrl, imageUrl, certPdfUrl } from '../utils/fileUrl';

const getToken  = () => localStorage.getItem('token');
const makeHdr = (includeContentType = false) => {
  const t = getToken();
  const h = includeContentType ? { 'Content-Type': 'application/json' } : {};
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};
const authHdr   = () => makeHdr(true);
const bearerHdr = () => makeHdr(false);

const ProgressBar = ({ value, max, color = '#450a0a' }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
    <div className="h-2.5 rounded-full transition-all duration-500"
         style={{ width: `${Math.round((value / Math.max(max, 1)) * 100)}%`, background: color }} />
  </div>
);

/* ══════════════════════ QUIZ PANEL ══════════════════════ */
const QuizPanel = ({ mod, onFinish }) => {
  const [answers, setAnswers] = useState({});
  const [result,  setResult]  = useState(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);

  const total = mod.quiz?.length || 0;
  const pick  = (qi, oi) => setAnswers(a => ({ ...a, [qi]: oi }));

  const submit = async () => {
    if (Object.keys(answers).length < total) { alert('Answer all questions before submitting.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/modules/${mod._id}/quiz`, {
        method: 'POST', headers: authHdr(),
        body: JSON.stringify({ answers: Array.from({ length: total }, (_, i) => answers[i]) }),
      });
      const data = await res.json();
      if (data.success) setResult(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (result) return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 text-center">
      {result.passed
        ? <CheckCircleSolid className="h-16 w-16 text-green-500 mx-auto mb-4" />
        : <XCircleIcon      className="h-16 w-16 text-red-400  mx-auto mb-4" />}
      <h3 className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
        {result.passed ? '🎉 Passed!' : 'Not Passed'}
      </h3>
      <p className="text-gray-600 mb-1 text-lg">Score: <strong>{result.score}%</strong> ({result.correct}/{result.total})</p>
      <p className="text-sm text-gray-400 mb-6">Pass mark: {result.passMark}%</p>
      <div className="text-left space-y-3 mb-6 max-h-64 overflow-y-auto">
        {result.results.map((r, i) => (
          <div key={i} className={`rounded-xl p-4 border ${r.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <p className="font-semibold text-sm text-gray-800 mb-2">Q{i+1}. {r.question}</p>
            {r.options.map((opt, j) => (
              <p key={j} className={`text-xs py-0.5 px-2 rounded mb-0.5 ${j===r.correctIndex?'bg-green-200 text-green-800 font-semibold':j===r.selected&&!r.isCorrect?'bg-red-200 text-red-700':'text-gray-600'}`}>
                {j===r.correctIndex?'✓ ':j===r.selected?'✗ ':'   '}{opt}
              </p>
            ))}
            {r.explanation && <p className="text-xs text-blue-600 mt-1 italic">💡 {r.explanation}</p>}
          </div>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!result.passed && (
          <button onClick={() => { setResult(null); setAnswers({}); setCurrent(0); }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-full text-sm hover:bg-gray-50 transition">
            Try Again
          </button>
        )}
        <button onClick={() => onFinish(result)}
          className="px-8 py-3 text-white font-bold rounded-full text-sm transition" style={{ background: '#450a0a' }}>
          {result.passed ? 'Continue →' : 'Back to Module'}
        </button>
      </div>
    </div>
  );

  const q = mod.quiz[current];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Quiz: {mod.title}</h3>
          <p className="text-sm text-gray-400">Pass mark: {mod.passMark}%</p>
        </div>
        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full">{current+1}/{total}</span>
      </div>
      <div className="flex gap-1.5 mb-5">
        {mod.quiz.map((_,i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i<current?'bg-green-400':i===current?'bg-primary-600':'bg-gray-200'}`} />
        ))}
      </div>
      <p className="text-base font-semibold text-gray-900 mb-4">{q.question}</p>
      <div className="space-y-3 mb-7">
        {q.options.map((opt,j) => (
          <button key={j} onClick={() => pick(current,j)}
            className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${answers[current]===j?'border-primary-600 bg-primary-50 text-primary-800':'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
            <span className={`inline-flex w-6 h-6 rounded-full border-2 text-xs font-bold mr-3 items-center justify-center flex-shrink-0 ${answers[current]===j?'bg-primary-600 border-primary-600 text-white':'border-gray-300 text-gray-500'}`}>
              {String.fromCharCode(65+j)}
            </span>
            {opt}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrent(c=>c-1)} disabled={current===0}
          className="flex items-center gap-1 px-4 py-2 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30">
          <ChevronLeftIcon className="h-4 w-4" /> Prev
        </button>
        {current < total-1 ? (
          <button onClick={() => setCurrent(c=>c+1)} disabled={answers[current]===undefined}
            className="flex items-center gap-1 px-6 py-2.5 text-white text-sm font-semibold rounded-full disabled:opacity-40 transition" style={{ background: '#450a0a' }}>
            Next <ChevronRightIcon className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={loading||Object.keys(answers).length<total}
            className="px-8 py-2.5 text-white text-sm font-bold rounded-full disabled:opacity-40 transition" style={{ background: '#16a34a' }}>
            {loading ? 'Submitting…' : 'Submit Quiz ✓'}
          </button>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════ MODULE VIEWER ══════════════════════ */
const ModuleViewer = ({ mod, progress, onBack, onProgressUpdate }) => {
  const [view,     setView]     = useState('content');
  const [starting, setStarting] = useState(false);

  const myProgress = progress.find(p => p.module === mod.title);
  const status     = myProgress?.status || 'not_started';
  const score      = myProgress?.score;

  const handleStart = async () => {
    if (status !== 'not_started') return;
    setStarting(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/modules/${mod._id}/start`, { method: 'PUT', headers: authHdr() });
      const data = await res.json();
      if (data.success) onProgressUpdate(data.data);
    } catch (e) { console.error(e); }
    finally { setStarting(false); }
  };

  const handleQuizFinish = (result) => {
    onProgressUpdate(result.progress);
    if (result.passed) setView('content');
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition">
        <ChevronLeftIcon className="h-4 w-4" /> Back to Modules
      </button>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-4 justify-between">
          <div className="flex-1">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${status==='completed'?'bg-green-100 text-green-700':status==='in_progress'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-500'}`}>
              {status.replace('_',' ')}
            </span>
            {score!=null && <span className="ml-2 text-xs text-gray-400">Score: {score}%</span>}
            <h2 className="text-2xl font-bold text-gray-900 mt-3 mb-1">{mod.title}</h2>
            <p className="text-gray-500">{mod.description}</p>
            {mod.duration && <p className="text-xs text-gray-400 mt-2">⏱ {mod.duration}</p>}
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            {status==='not_started' && (
              <button onClick={handleStart} disabled={starting}
                className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full text-sm" style={{ background: '#450a0a' }}>
                <PlayIcon className="h-4 w-4" />
                {starting ? 'Starting…' : 'Start Module'}
              </button>
            )}
            {status!=='not_started' && mod.quiz?.length>0 && (
              <button onClick={() => setView('quiz')}
                className="flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-full text-sm"
                style={{ background: status==='completed' ? '#16a34a' : '#450a0a' }}>
                {status==='completed' ? <CheckCircleIcon className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
                {status==='completed' ? 'Retake Quiz' : 'Take Quiz'}
              </button>
            )}
          </div>
        </div>
        {status!=='not_started' && (
          <div className="flex gap-1 mt-6 bg-gray-100 rounded-xl p-1 w-fit">
            {['content', mod.quiz?.length>0&&'quiz'].filter(Boolean).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition ${view===v?'bg-white shadow text-gray-900':'text-gray-500 hover:text-gray-700'}`}>
                {v==='content' ? '📖 Content' : '📝 Quiz'}
              </button>
            ))}
          </div>
        )}
      </div>
      {status==='not_started' ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <BookOpenIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Click "Start Module" above to begin.</p>
        </div>
      ) : view==='quiz' && mod.quiz?.length>0 ? (
        <QuizPanel mod={mod} onFinish={handleQuizFinish} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-10">
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }} className="text-base text-gray-700">
            {mod.content}
          </div>
          {mod.quiz?.length>0 && status!=='completed' && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 mb-4">Finished reading? Take the quiz to complete this module.</p>
              <button onClick={() => setView('quiz')}
                className="px-8 py-3 text-white font-bold rounded-full text-sm" style={{ background: '#450a0a' }}>
                Take Quiz →
              </button>
            </div>
          )}
          {/* Mark complete button for modules without a quiz */}
          {status === 'in_progress' && (!mod.quiz || mod.quiz.length === 0) && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 mb-4">Finished reading? Mark this module as complete.</p>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE_URL}/modules/${mod._id}/quiz`, {
                      method: 'POST', headers: authHdr(),
                      body: JSON.stringify({ answers: [] }),
                    });
                    const data = await res.json();
                    if (data.success) onProgressUpdate(data.progress);
                  } catch (e) { console.error(e); }
                }}
                className="px-8 py-3 text-white font-bold rounded-full text-sm"
                style={{ background: '#16a34a' }}
              >
                ✓ Mark as Complete
              </button>
            </div>
          )}
         {status==='completed' && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-3">
              <CheckCircleSolid className="h-6 w-6 text-green-500" />
              <span className="text-green-700 font-semibold">Module completed{score!=null?` — ${score}%`:''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════ CERT MODAL (phone-based) ══════════════════════ */
const CertModal = ({ type, onClose, onSubmit }) => {
  const [phone,   setPhone]   = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  const label = type === 'theory' ? 'Theory Training Certificate' : 'On-Site Training Certificate';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 10) { setErr('Please enter a valid 10-digit mobile number.'); return; }
    setErr('');
    setLoading(true);
    await onSubmit(type, phone.trim(), message);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Apply for {label}</h3>
        <p className="text-sm text-gray-500 mb-5">
          We will contact you on the number below regarding your certificate.
          Please provide a number you actively use.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
              <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300 flex-shrink-0">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
                required
              />
            </div>
            {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
            <p className="text-xs text-amber-600 mt-1">
              ⚠ Please double-check — we will call/message this number when your certificate is ready.
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message (optional)</label>
            <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Any message for the admin…"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-full text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 text-white font-bold rounded-full text-sm disabled:opacity-60 transition" style={{ background: '#450a0a' }}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════ MAIN DASHBOARD ══════════════════════ */
const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('training');
  const [modules,      setModules]      = useState([]);
  const [progress,     setProgress]     = useState([]);
  const [openMod,      setOpenMod]      = useState(null);
  const [certRequests, setCertRequests] = useState([]);
  const [certModal,    setCertModal]    = useState(null);
  const [certMsg,      setCertMsg]      = useState('');
  const [certErr,      setCertErr]      = useState('');
  const [myCert,       setMyCert]       = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showWelcome,    setShowWelcome]    = useState(false);
  const photoRef = useRef(null);

  useEffect(() => {
    const raw   = localStorage.getItem('user');
    const token = getToken();
    if (!raw || !token) { navigate('/login'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'student') { navigate('/login'); return; }
    setUser(u);

    // Show welcome popup only on first login (flag cleared after display)
    const firstLogin = localStorage.getItem('studentFirstLogin');
    if (firstLogin === 'true') {
      setShowWelcome(true);
      localStorage.removeItem('studentFirstLogin');
    }

    const init = async () => {
      await Promise.all([fetchModules(), fetchProgress(u), fetchCerts(), fetchMyCert()]);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const fetchModules  = async () => {
    const res  = await fetch(`${API_BASE_URL}/modules`, { headers: bearerHdr() });
    const data = await res.json();
    setModules(data.data || []);
  };

  const fetchProgress = async (u) => {
    const res  = await fetch(`${API_BASE_URL}/training/progress`, { headers: bearerHdr() });
    const data = await res.json();
    if (data.success) {
      const prog = data.data || [];
      setProgress(prog);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.trainingProgress = prog;
      localStorage.setItem('user', JSON.stringify(stored));
    }
  };

  const fetchCerts = async () => {
    const res  = await fetch(`${API_BASE_URL}/modules/cert-requests/mine`, { headers: bearerHdr() });
    const data = await res.json();
    if (data.success) setCertRequests(data.data || []);
  };

  const fetchMyCert = async () => {
    try {
      const res  = await fetch(`${API_BASE_URL}/modules/my-certificate`, { headers: bearerHdr() });
      const data = await res.json();
      if (data.success) setMyCert(data.data);
    } catch (e) { console.error(e); }
  };

  const handleProgressUpdate = (newProgress) => {
    setProgress(newProgress);
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    stored.trainingProgress = newProgress;
    localStorage.setItem('user', JSON.stringify(stored));
    setUser(prev => ({ ...prev, trainingProgress: newProgress }));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  /* ── Profile photo upload ── */
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const res  = await fetch(`${API_BASE_URL}/auth/profile-photo`, { method: 'PUT', headers: bearerHdr(), body: fd });
      const data = await res.json();
      if (data.success) {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.profilePhoto = data.data.profilePhoto;
        localStorage.setItem('user', JSON.stringify(stored));
        setUser(prev => ({ ...prev, profilePhoto: data.data.profilePhoto }));
      }
    } catch (e) { console.error(e); }
    finally { setPhotoUploading(false); }
  };

  /* ── Cert submit ── */
  const submitCert = async (type, certPhone, message) => {
    setCertErr('');
    const res  = await fetch(`${API_BASE_URL}/modules/cert-request`, {
      method: 'POST', headers: authHdr(),
      body: JSON.stringify({ type, certPhone, message }),
    });
    const data = await res.json();
    if (data.success) {
      setCertMsg(`Your ${type === 'theory' ? 'theory' : 'on-site'} certificate request has been submitted! We will contact you at ${certPhone}.`);
      setCertModal(null);
      fetchCerts();
    } else {
      setCertErr(data.error || 'Failed to submit.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-gray-500">Loading your portal…</p>
      </div>
    </div>
  );
  if (!user) return null;

  const totalMods     = modules.length;
  const completedMods = progress.filter(p => p.status === 'completed').length;
  const allDone       = totalMods > 0 && completedMods >= totalMods;
  const getModProg    = (mod) => progress.find(p => p.module === mod.title) || { status: 'not_started' };

  const statusStyle = (s) => ({
    completed:   { bg: 'bg-green-100',  text: 'text-green-700'  },
    in_progress: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
    not_started: { bg: 'bg-gray-100',   text: 'text-gray-500'   },
  }[s] || { bg: 'bg-gray-100', text: 'text-gray-500' });

  const TABS = [
    { id: 'training',  label: 'Training',     icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
    { id: 'certs',     label: 'Certificates', icon: <TrophyIcon                className="h-5 w-5" /> },
    { id: 'overview',  label: 'Overview',     icon: <AcademicCapIcon           className="h-5 w-5" /> },
    { id: 'profile',   label: 'Profile',      icon: <UserIcon                  className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fc' }}>

      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Profile photo */}
          <div className="relative flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center cursor-pointer ring-2 ring-white shadow"
              onClick={() => photoRef.current?.click()}
              title="Change profile photo"
            >
              {user.profilePhoto
                ? <img src={imageUrl(user.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-primary-700 font-bold text-lg">{user.name?.charAt(0).toUpperCase()}</span>
              }
            </div>
            {photoUploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer shadow"
                 onClick={() => photoRef.current?.click()}>
              <CameraIcon className="h-2.5 w-2.5 text-white" />
            </div>
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-none">Student Portal</h1>
            <p className="text-xs text-gray-500 mt-0.5">Welcome, <span className="font-semibold text-primary-700">{user.name}</span></p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Tab nav */}
        <nav className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setOpenMod(null); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition flex-shrink-0 ${
                activeTab===tab.id ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── TRAINING ── */}
        {activeTab === 'training' && (
          openMod ? (
            <ModuleViewer mod={openMod} progress={progress} onBack={() => setOpenMod(null)} onProgressUpdate={handleProgressUpdate} />
          ) : (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Training Progress</h2>
                    <p className="text-sm text-gray-500">{completedMods} of {totalMods} modules completed</p>
                  </div>
                  <span className="text-2xl font-bold text-primary-700">
                    {totalMods > 0 ? Math.round((completedMods/totalMods)*100) : 0}%
                  </span>
                </div>
                <ProgressBar value={completedMods} max={totalMods} />
                {allDone && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <TrophyIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      🎉 All modules completed! Apply for your Theory Certificate in the Certificates tab.
                    </p>
                  </div>
                )}
              </div>

              {modules.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-600 mb-2">No modules yet</h3>
                  <p className="text-gray-400 text-sm">Training modules will appear here once added by admin.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod, idx) => {
                    const mp       = getModProg(mod);
                    const ss       = statusStyle(mp.status);
                    const isLocked = idx > 0 && getModProg(modules[idx-1]).status === 'not_started';
                    return (
                      <button key={mod._id}
                        onClick={() => !isLocked && setOpenMod(mod)}
                        disabled={isLocked}
                        className={`w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 text-left transition-all ${isLocked?'opacity-50 cursor-not-allowed':'hover:shadow-md hover:border-primary-200 cursor-pointer'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${mp.status==='completed'?'bg-green-500 text-white':mp.status==='in_progress'?'bg-blue-500 text-white':'bg-gray-200 text-gray-500'}`}>
                          {mp.status==='completed' ? '✓' : idx+1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-gray-900 truncate text-base">{mod.title}</p>
                            {isLocked && <span className="text-gray-400 text-xs">🔒</span>}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{mod.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {mod.duration && <span className="text-xs text-gray-400">⏱ {mod.duration}</span>}
                            {mod.quiz?.length>0 && <span className="text-xs text-gray-400">📝 {mod.quiz.length}-Q quiz</span>}
                            {mp.score!=null && <span className="text-xs text-gray-400">Score: {mp.score}%</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ss.bg} ${ss.text}`}>
                            {mp.status.replace('_',' ')}
                          </span>
                          {!isLocked && <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )
        )}

        {/* ── CERTIFICATES ── */}
        {activeTab === 'certs' && (
          <div className="space-y-5">
            {certMsg && (
              <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <CheckCircleSolid className="h-5 w-5 flex-shrink-0 mt-0.5" /><span>{certMsg}</span>
              </div>
            )}
            {certErr && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{certErr}</div>}

            {/* ── Admin-Issued Certificate ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <DocumentCheckIcon className="h-7 w-7 text-green-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">My Certificate</h3>
                  <p className="text-gray-500 text-sm mt-1">Certificate issued by Nav Nirmiti Constructions admin.</p>
                </div>
              </div>
              {myCert ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleSolid className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800">Certificate Available</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {myCert.type === 'theory' ? 'Theory Training' : 'On-Site Training'} Certificate
                        · Issued {new Date(myCert.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <a
                      href={certPdfUrl(myCert._id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-full transition"
                      style={{ background: '#16a34a' }}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" /> Download Certificate PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 text-center">
                  <ClockIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-600 mb-1">Certificate Pending</p>
                  <p className="text-sm text-gray-400">Your certificate has not been uploaded yet. Please check back later.</p>
                </div>
              )}
            </div>

            {/* Theory cert */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <DocumentCheckIcon className="h-7 w-7 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Theory Training Certificate</h3>
                  <p className="text-gray-500 text-sm mt-1">Awarded after completing all {totalMods} online modules and quizzes.</p>
                </div>
              </div>
              <div className="mb-5">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-semibold text-gray-700">{completedMods}/{totalMods} modules</span>
                </div>
                <ProgressBar value={completedMods} max={totalMods} color={allDone?'#16a34a':'#450a0a'} />
              </div>
              {certRequests.filter(r=>r.type==='theory').map(r => (
                <div key={r._id} className="mb-4 rounded-xl p-4 border border-gray-200 bg-gray-50 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Your Request</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status==='issued'?'bg-green-100 text-green-700':r.status==='rejected'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">Contact number: {r.certPhone}</p>
                  {r.adminNotes && <p className="text-gray-600 mt-1 text-xs italic">Admin note: {r.adminNotes}</p>}
                  {/* Download issued PDF */}
                  {r.certificatePdf && (
                    <a
                      href={certPdfUrl(r._id)}
                      download={`${r.type}-certificate-${r.studentName?.replace(/\s+/g, '-')}.pdf`}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full transition"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" /> Download Certificate PDF
                    </a>
                  )}
                </div>
              ))}
              {allDone ? (
                certRequests.some(r=>r.type==='theory'&&r.status==='pending') ? (
                  <p className="text-sm text-amber-600 font-medium bg-amber-50 px-4 py-3 rounded-xl">
                    ⏳ Your request is pending admin review.
                  </p>
                ) : certRequests.some(r=>r.type==='theory'&&['approved','issued'].includes(r.status)) ? null : (
                  <button onClick={() => { setCertMsg(''); setCertErr(''); setCertModal('theory'); }}
                    className="w-full sm:w-auto px-8 py-3 text-white font-bold rounded-full text-sm transition shadow-md" style={{ background: '#450a0a' }}>
                    🎓 Apply for Theory Certificate
                  </button>
                )
              ) : (
                <p className="text-sm text-gray-400">Complete all {totalMods} modules to unlock. ({completedMods}/{totalMods} done)</p>
              )}
            </div>

            {/* On-site cert */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrophyIcon className="h-7 w-7 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">On-Site Training Certificate</h3>
                  <p className="text-gray-500 text-sm mt-1">Apply after completing your physical on-site training at Nav Nirmiti.</p>
                </div>
              </div>
              {certRequests.filter(r=>r.type==='onsite').map(r => (
                <div key={r._id} className="mb-4 rounded-xl p-4 border border-gray-200 bg-gray-50 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-700">Your Request</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status==='issued'?'bg-green-100 text-green-700':r.status==='rejected'?'bg-red-100 text-red-600':'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">Contact number: {r.certPhone}</p>
                  {r.adminNotes && <p className="text-gray-600 mt-1 text-xs italic">Admin note: {r.adminNotes}</p>}
                  {r.certificatePdf && (
                    <a
                      href={certPdfUrl(r._id)}
                      download={`onsite-certificate-${r.studentName?.replace(/\s+/g, '-')}.pdf`}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full transition"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" /> Download Certificate PDF
                    </a>
                  )}
                </div>
              ))}
              {certRequests.some(r=>r.type==='onsite'&&r.status==='pending') ? (
                <p className="text-sm text-amber-600 font-medium bg-amber-50 px-4 py-3 rounded-xl">⏳ Your request is pending review.</p>
              ) : certRequests.some(r=>r.type==='onsite'&&['approved','issued'].includes(r.status)) ? null : (
                <button onClick={() => { setCertMsg(''); setCertErr(''); setCertModal('onsite'); }}
                  className="w-full sm:w-auto px-8 py-3 text-white font-bold rounded-full text-sm transition shadow-md" style={{ background: '#1d4ed8' }}>
                  🏗 Apply for On-Site Certificate
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total',     value: totalMods,                                              icon: <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />,  color: 'bg-blue-100'  },
                { label: 'Completed', value: completedMods,                                          icon: <CheckCircleIcon           className="h-6 w-6 text-green-600" />, color: 'bg-green-100' },
                { label: 'Pending',   value: progress.filter(p=>p.status==='in_progress').length,    icon: <ClockIcon                 className="h-6 w-6 text-amber-600" />, color: 'bg-amber-100' },
              ].map((s,i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{s.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Student Training Program</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Welcome to the Nav Nirmiti student internship program. Complete all online modules and quizzes
                to earn your Theory Certificate, then apply for the On-Site Certificate after physical training.
              </p>

              {/* Coordinator block — name prominent, tight spacing, contact below */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="font-bold text-gray-900"
                   style={{ fontSize: '1.2rem', lineHeight: 1.1, margin: 0 }}>
                  Er. Aakanksha More
                </p>
                <p className="text-gray-600"
                   style={{ fontSize: '0.95rem', margin: '2px 0 10px', lineHeight: 1.3 }}>
                  Head – Business Operations &amp; Training Coordinator
                </p>
                <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600">
                  <a href="tel:+919370773736"
                     className="flex items-center gap-1.5 hover:text-primary-700 transition"
                     style={{ fontSize: '0.9rem' }}>
                    <PhoneIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                    +91 93707 73736
                  </a>
                  <a href="mailto:aakankshamore.navnirmiti@gmail.com"
                     className="flex items-center gap-1.5 hover:text-primary-700 transition"
                     style={{ fontSize: '0.9rem' }}>
                    <EnvelopeIcon className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                    aakankshamore.navnirmiti@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {/* Profile photo large */}
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center ring-4 ring-white shadow-md">
                  {user.profilePhoto
                    ? <img src={imageUrl(user.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                    : <span className="text-primary-700 font-bold text-3xl">{user.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <button
                  onClick={() => photoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center shadow-md transition"
                  title="Change photo"
                >
                  <CameraIcon className="h-4 w-4 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <button onClick={() => photoRef.current?.click()}
                  className="mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  {photoUploading ? 'Uploading…' : 'Change profile photo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Personal</h3>
                <div className="space-y-3 text-sm">
                  {[['Full Name',   user.name],['Email',user.email],['Mobile',user.mobileNumber||'—'],['Roll No.',user.rollNumber||'—']].map(([l,v]) => (
                    <div key={l} className="flex gap-3">
                      <span className="font-semibold text-gray-600 w-28 flex-shrink-0">{l}</span>
                      <span className="text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Academic</h3>
                <div className="space-y-3 text-sm">
                  {[['College',user.collegeName||'—'],['Course',user.courseName||'—'],['City',user.city||'—'],['State',user.state||'—']].map(([l,v]) => (
                    <div key={l} className="flex gap-3">
                      <span className="font-semibold text-gray-600 w-28 flex-shrink-0">{l}</span>
                      <span className="text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />

      {certModal && (
        <CertModal type={certModal} onClose={() => setCertModal(null)} onSubmit={submitCert} />
      )}

      {/* ── Welcome popup (shown once on first login) — matches Client modal styling ── */}
      {showWelcome && user && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(10,2,2,0.72)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full overflow-hidden"
            style={{ maxWidth: '540px' }}
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          >
            <div className="h-1.5 w-full" style={{ background: 'linear-gradient(to right, #450a0a, #c0392b, #450a0a)' }} />

            <div className="px-8 py-8">
              {/* Animated checkmark */}
              <motion.div
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { delay: 0.15, type: 'spring', stiffness: 260, damping: 18 } }}
              >
                <CheckCircleSolid className="h-11 w-11 text-green-500" />
              </motion.div>

              {/* Greeting in accent font */}
              <p className="text-center mb-2 text-primary-700"
                 style={{ fontFamily: 'var(--font-accent)', fontSize: '1.1rem', lineHeight: 1.5 }}>
                Welcome to your training journey!
              </p>
              <h2 className="text-center font-bold text-gray-900 mb-5"
                  style={{ fontFamily: 'var(--font-primary)', fontSize: 'clamp(1.3rem, 3vw, 1.65rem)', lineHeight: 1.2 }}>
                Hello, {user.name}! 👋
              </h2>

              {/* Message */}
              <div className="text-gray-700 leading-relaxed text-left rounded-2xl p-5 mb-6"
                   style={{ background: '#fdf8f8', border: '1px solid #f0e0e0', fontSize: '0.96rem', fontFamily: 'var(--font-primary)' }}>
                <p className="mb-3">
                  Welcome to the <strong>Student Training Program</strong>! We're delighted to have you on board.
                  Your login was successful and you can now access the program and begin your learning journey.
                </p>
                <p className="text-gray-500" style={{ fontSize: '0.88rem' }}>
                  We wish you the very best and look forward to supporting you throughout your training!
                </p>
              </div>

              {/* Signature */}
              <div className="rounded-2xl px-6 py-5 mb-6 text-left" style={{ background: '#1a0505' }}>
                <p className="font-bold text-white" style={{ margin: 0, fontSize: '1rem', lineHeight: 1.1 }}>Er. Aakanksha More</p>
                <p className="text-gray-300" style={{ fontSize: '0.82rem', margin: '2px 0 8px', lineHeight: 1.3 }}>Head – Business Operations &amp; Training Coordinator</p>
                <div className="flex flex-wrap gap-3" style={{ fontSize: '0.75rem' }}>
                  <a href="tel:+919370773736" className="text-gray-400 hover:text-white transition flex items-center gap-1">
                    <PhoneIcon className="h-3 w-3" /> +91 93707 73736
                  </a>
                  <a href="mailto:aakankshamore.navnirmiti@gmail.com" className="text-gray-400 hover:text-white transition flex items-center gap-1">
                    <EnvelopeIcon className="h-3 w-3" /> aakankshamore.navnirmiti@gmail.com
                  </a>
                </div>
              </div>

              <button
                onClick={() => setShowWelcome(false)}
                className="w-full py-4 text-white font-bold rounded-full text-base transition shadow-lg"
                style={{ background: '#450a0a', fontFamily: 'var(--font-primary)' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#5e0e0e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#450a0a')}
              >
                Start My Learning Journey →
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentDashboard;
