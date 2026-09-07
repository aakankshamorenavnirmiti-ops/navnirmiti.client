import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon, UserIcon, CameraIcon,
  CheckCircleIcon, ClockIcon, DocumentArrowDownIcon,
  PhotoIcon, PaperClipIcon, ChatBubbleLeftEllipsisIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../utils/api';
import { fileUrl, imageUrl } from '../utils/fileUrl';

const getToken  = () => localStorage.getItem('token');
const authHdr   = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });
const bearerHdr = () => ({ Authorization: `Bearer ${getToken()}` });

/* ── Stage definitions ── */
const STAGES = [
  { id: 'plan',       label: 'Plan',        icon: '📋', desc: 'Project plan document' },
  { id: 'agreement',  label: 'Agreement',   icon: '✍️', desc: 'Signed agreement' },
  { id: 'inProgress', label: 'In Progress', icon: '🏗️', desc: 'Construction underway' },
  { id: 'completion', label: 'Completion',  icon: '🏠', desc: 'Final handover' },
];

/* ── Compute stage statuses from project ── */
const getStageStatus = (project, stageId) => {
  if (!project) return 'pending';
  switch (stageId) {
    case 'plan':       return project.planPdf        ? 'done'       : 'pending';
    case 'agreement':  return project.agreementPdf   ? 'done'       : project.planPdf ? 'active' : 'pending';
    case 'inProgress': return project.completionImage ? 'done'      : project.agreementPdf ? 'active' : 'pending';
    case 'completion': return project.completionImage ? 'done'       : project.agreementPdf ? 'active' : 'pending';
    default: return 'pending';
  }
};

/* ── Stage node ── */
const StageNode = ({ stage, status, onClick, isLast }) => {
  const canClick = status === 'done' && (stage.id === 'plan' || stage.id === 'agreement' || stage.id === 'completion');
  return (
    <div className="flex items-center flex-1">
      <div className="flex flex-col items-center">
        <button
          onClick={canClick ? onClick : undefined}
          disabled={!canClick}
          className={`flex flex-col items-center transition-all ${canClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
          title={canClick ? 'Click to view/download' : stage.desc}
        >
          {/* Circle */}
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl border-4 transition-all duration-300 shadow-sm ${
            status === 'done'   ? 'bg-green-500 border-green-500 text-white' :
            status === 'active' ? 'bg-primary-600 border-primary-600 text-white animate-pulse' :
            'bg-white border-gray-300 text-gray-400'
          }`}>
            {status === 'done'
              ? <CheckSolid className="h-7 w-7 text-white" />
              : <span style={{ fontSize: '1.3rem' }}>{stage.icon}</span>
            }
          </div>
          {/* Label */}
          <p className={`mt-2 text-xs font-bold text-center whitespace-nowrap ${
            status === 'done' ? 'text-green-700' : status === 'active' ? 'text-primary-700' : 'text-gray-400'
          }`}>{stage.label}</p>
          {/* Status pill */}
          <span className={`mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
            status === 'done'   ? 'bg-green-100 text-green-700' :
            status === 'active' ? 'bg-primary-100 text-primary-700' :
            'bg-gray-100 text-gray-400'
          }`}>
            {status === 'done' ? 'Done' : status === 'active' ? 'Active' : 'Pending'}
          </span>
          {canClick && (
            <span className="mt-1 text-xs text-primary-600 font-medium flex items-center gap-0.5">
              <ArrowDownTrayIcon className="h-3 w-3" /> View
            </span>
          )}
        </button>
      </div>
      {/* Connector line */}
      {!isLast && (
        <div className={`flex-1 h-1 mx-1 md:mx-3 rounded-full transition-all duration-500 ${
          status === 'done' ? 'bg-green-400' : 'bg-gray-200'
        }`} />
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════ */
const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user,      setUser]      = useState(null);
  const [project,   setProject]   = useState(null);
  const [queries,   setQueries]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('project');
  const photoRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  /* query form */
  const [qForm, setQForm]     = useState({ requestType: 'query', message: '' });
  const [qFile, setQFile]     = useState(null);
  const [qStatus, setQStatus] = useState(null);
  const [qError,  setQError]  = useState('');

  /* auth check */
  useEffect(() => {
    const raw   = localStorage.getItem('user');
    const token = getToken();
    if (!raw || !token) { navigate('/client-login'); return; }
    const u = JSON.parse(raw);
    if (u.role !== 'client') { navigate('/client-login'); return; }
    setUser(u);
    loadAll();
  }, [navigate]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [pRes, qRes] = await Promise.all([
        fetch(`${API_BASE_URL}/clients/project`,      { headers: authHdr() }),
        fetch(`${API_BASE_URL}/clients/queries/mine`, { headers: authHdr() }),
      ]);
      const [pData, qData] = await Promise.all([pRes.json(), qRes.json()]);
      if (pData.success) setProject(pData.data);
      if (qData.success) setQueries(qData.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/client-login');
  };

  const handlePhotoChange = async e => {
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

  const openFile = (filename) => {
    window.open(fileUrl(filename), '_blank');
  };

  const handleStageClick = (stageId) => {
    if (!project) return;
    if (stageId === 'plan' && project.planPdf)             openFile(project.planPdf);
    if (stageId === 'agreement' && project.agreementPdf)   openFile(project.agreementPdf);
    if (stageId === 'completion' && project.completionImage) openFile(project.completionImage);
  };

  const handleQuerySubmit = async e => {
    e.preventDefault();
    if (!qForm.message.trim()) { setQError('Please enter a message.'); return; }
    setQStatus('submitting'); setQError('');
    const fd = new FormData();
    fd.append('requestType', qForm.requestType);
    fd.append('message',     qForm.message);
    if (qFile) fd.append('attachment', qFile);
    try {
      const res  = await fetch(`${API_BASE_URL}/clients/queries`, { method: 'POST', headers: bearerHdr(), body: fd });
      const data = await res.json();
      if (data.success) {
        setQStatus('success');
        setQForm({ requestType: 'query', message: '' });
        setQFile(null);
        loadAll();
        setTimeout(() => setQStatus(null), 4000);
      } else {
        setQError(data.error || 'Failed to submit.'); setQStatus('error');
      }
    } catch { setQError('Network error.'); setQStatus('error'); }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8f9fc' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading your project…</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'project', label: 'My Project',  icon: '🏗️' },
    { id: 'gallery', label: 'Site Gallery', icon: '📸' },
    { id: 'queries', label: 'Queries',      icon: '💬' },
    { id: 'profile', label: 'My Profile',   icon: '👤' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fc' }}>

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center cursor-pointer ring-2 ring-white shadow"
                 onClick={() => photoRef.current?.click()}>
              {user.profilePhoto
                ? <img src={fileUrl(user.profilePhoto)} alt="" className="w-full h-full object-cover" />
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
            <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-none">Client Portal</h1>
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition flex-shrink-0 ${
                activeTab === tab.id ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* ── PROJECT TAB ── */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            {/* Project title */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">{project?.projectTitle || 'My Project'}</h2>
              <p className="text-sm text-gray-500">Track the progress of your project through each stage below.</p>
            </div>

            {/* ── Horizontal stage flowchart ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">
              <h3 className="font-bold text-gray-800 mb-6 text-sm uppercase tracking-wide">Project Pipeline</h3>
              <div className="flex items-start w-full overflow-x-auto pb-2">
                {STAGES.map((stage, idx) => {
                  const status = getStageStatus(project, stage.id);
                  return (
                    <StageNode
                      key={stage.id}
                      stage={stage}
                      status={status}
                      isLast={idx === STAGES.length - 1}
                      onClick={() => handleStageClick(stage.id)}
                    />
                  );
                })}
              </div>

              {/* Document download shortcuts */}
              {(project?.planPdf || project?.agreementPdf) && (
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
                  {project.planPdf && (
                    <a href={fileUrl(project.planPdf)} download
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full transition"
                      style={{ background: '#450a0a' }}>
                      <DocumentArrowDownIcon className="h-4 w-4" /> Download Plan PDF
                    </a>
                  )}
                  {project.agreementPdf && (
                    <a href={fileUrl(project.agreementPdf)} download
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full transition"
                      style={{ background: '#1d4ed8' }}>
                      <DocumentArrowDownIcon className="h-4 w-4" /> Download Agreement PDF
                    </a>
                  )}
                  {project.completionImage && (
                    <a href={fileUrl(project.completionImage)} download
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-full transition"
                      style={{ background: '#16a34a' }}>
                      <DocumentArrowDownIcon className="h-4 w-4" /> Download Completion Image
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Stage timeline details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Stage Timeline</h3>
              <div className="space-y-3">
                {[
                  { label: 'Plan uploaded',       date: project?.planUploadedAt,        done: !!project?.planPdf },
                  { label: 'Agreement uploaded',  date: project?.agreementUploadedAt,   done: !!project?.agreementPdf },
                  { label: 'Work in progress',    date: project?.agreementUploadedAt,   done: !!project?.agreementPdf && !project?.completionImage },
                  { label: 'Project completed',   date: project?.completionUploadedAt,  done: !!project?.completionImage },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    {item.done
                      ? <CheckSolid className="h-5 w-5 text-green-500 flex-shrink-0" />
                      : <ClockIcon  className="h-5 w-5 text-gray-300 flex-shrink-0" />
                    }
                    <span className={item.done ? 'text-gray-800 font-medium' : 'text-gray-400'}>{item.label}</span>
                    {item.done && item.date && (
                      <span className="ml-auto text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1">In-Progress Site Gallery</h2>
              <p className="text-sm text-gray-500 mb-5">
                Photos of your site uploaded by the Nav Nirmiti team — most recent first.
              </p>

              {!project?.progressImages?.length ? (
                <div className="text-center py-16">
                  <PhotoIcon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-500 mb-2">No photos yet</h3>
                  <p className="text-gray-400 text-sm">Site progress photos will appear here once the team uploads them.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.progressImages.map((img, i) => (
                    <div key={img._id || i} className="group relative rounded-xl overflow-hidden shadow-sm cursor-pointer"
                         onClick={() => window.open(fileUrl(img.filename), '_blank')}>
                      <img
                        src={fileUrl(img.filename)}
                        alt={img.caption || `Site photo ${i + 1}`}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-end">
                        <div className="w-full p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-white text-xs font-medium truncate">{img.caption || 'Site photo'}</p>
                          <p className="text-gray-300 text-xs">{new Date(img.uploadedAt).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── QUERIES TAB ── */}
        {activeTab === 'queries' && (
          <div className="space-y-5">
            {/* Submit form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-1">Submit a Query or Approval Request</h2>
              <p className="text-sm text-gray-500 mb-5">Have a question? Need approval for something? Send us a message below.</p>

              {qStatus === 'success' && (
                <div className="mb-4 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <CheckSolid className="h-5 w-5 flex-shrink-0" /> Request submitted! We'll respond shortly.
                </div>
              )}
              {qError && <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm">{qError}</div>}

              <form onSubmit={handleQuerySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Request Type</label>
                  <div className="flex gap-3">
                    {['query', 'approval', 'change_request'].map(t => (
                      <button key={t} type="button" onClick={() => setQForm(f => ({ ...f, requestType: t }))}
                        className={`px-4 py-2 rounded-full text-xs font-semibold transition capitalize ${qForm.requestType === t ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        style={qForm.requestType === t ? { background: '#450a0a' } : {}}>
                        {t === 'change_request' ? 'Change Request' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                  <textarea rows={4} value={qForm.message} onChange={e => setQForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your query, approval need, or change request in detail…"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Attachment (optional)</label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-primary-600 hover:text-primary-700 font-medium w-fit">
                    <PaperClipIcon className="h-4 w-4" />
                    {qFile ? qFile.name : 'Attach a file (PDF, image, doc)'}
                    <input type="file" className="hidden" accept="image/*,application/pdf,.doc,.docx"
                      onChange={e => setQFile(e.target.files[0])} />
                  </label>
                </div>

                <button type="submit" disabled={qStatus === 'submitting'}
                  className="px-8 py-3 text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center gap-2"
                  style={{ background: '#450a0a' }}>
                  {qStatus === 'submitting'
                    ? <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Submitting…</>
                    : <><ChatBubbleLeftEllipsisIcon className="h-4 w-4" /> Submit Request</>
                  }
                </button>
              </form>
            </div>

            {/* Previous queries */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-bold text-gray-800 mb-4">Your Previous Requests ({queries.length})</h3>
              {queries.length === 0 ? (
                <p className="text-sm text-gray-400">No requests submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {queries.map(q => (
                    <div key={q._id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                            q.requestType === 'query' ? 'bg-blue-100 text-blue-700' :
                            q.requestType === 'approval' ? 'bg-amber-100 text-amber-700' :
                            'bg-purple-100 text-purple-700'}`}>
                            {q.requestType === 'change_request' ? 'Change Request' : q.requestType}
                          </span>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          q.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          q.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                          {q.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{q.message}</p>
                      {q.attachment && (
                        <a href={fileUrl(q.attachment)} download className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                          <PaperClipIcon className="h-3.5 w-3.5" /> {q.attachment}
                        </a>
                      )}
                      {q.adminReply && (
                        <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2.5 border-l-2 border-primary-400">
                          <p className="text-xs font-bold text-gray-600 mb-1">Nav Nirmiti Reply:</p>
                          <p className="text-sm text-gray-700">{q.adminReply}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{new Date(q.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center ring-4 ring-white shadow-md">
                  {user.profilePhoto
                    ? <img src={fileUrl(user.profilePhoto)} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary-700 font-bold text-3xl">{user.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <button onClick={() => photoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center shadow-md transition">
                  <CameraIcon className="h-4 w-4 text-white" />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <button onClick={() => photoRef.current?.click()} className="mt-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  {photoUploading ? 'Uploading…' : 'Change profile photo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              {[
                ['Full Name',   user.name],
                ['Email',       user.email],
                ['Phone',       user.phone || '—'],
                ['Address',     user.address || '—'],
                ['Account Type','Client'],
                ['Member Since', new Date(user.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })],
              ].map(([l, v]) => (
                <div key={l} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-600 w-28 flex-shrink-0">{l}</span>
                  <span className="text-gray-800">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
