import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon, DocumentTextIcon, EnvelopeIcon,
  UserGroupIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon, MagnifyingGlassIcon, CheckCircleIcon,
  TrashIcon, EyeIcon, PlusIcon, BriefcaseIcon,
  ChartBarIcon, BellIcon, ShieldCheckIcon, ClipboardDocumentListIcon,
  PencilIcon, PhotoIcon, ChatBubbleLeftEllipsisIcon,
  CloudArrowUpIcon, AcademicCapIcon, TrophyIcon, UserIcon,
  PaperClipIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import logo from '../image/logo.png';
import { API_BASE_URL } from '../utils/api';
import { fileUrl, imageUrl, certPdfUrl } from '../utils/fileUrl';

/* ── Auth helpers ── */
const getToken  = () => localStorage.getItem('adminToken');
const getUser   = () => { try { return JSON.parse(localStorage.getItem('adminUser')); } catch { return null; } };
const authHdr = (includeContentType = false) => {
  const t = getToken();
  const h = includeContentType ? { 'Content-Type': 'application/json' } : {};
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
};
const jsonHdr   = () => authHdr(true);
const bearerHdr = () => authHdr(false);

/* ── Reusable UI pieces ── */
const StatusBadge = ({ status }) => {
  const map = {
    new:         'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100  text-blue-800',
    reviewed:    'bg-purple-100 text-purple-800',
    closed:      'bg-gray-100  text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {(status || '—').replace('_', ' ')}
    </span>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const DetailModal = ({ title, data, onClose }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><XMarkIcon className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-2.5">
          {Object.entries(data).map(([k, v]) => {
            if (['_id', '__v'].includes(k)) return null;
            return (
              <div key={k} className="flex gap-2 text-sm">
                <span className="font-semibold text-gray-700 capitalize min-w-[130px] flex-shrink-0">{k.replace(/([A-Z])/g, ' $1')}:</span>
                <span className="text-gray-600 break-words">{Array.isArray(v) ? v.join(', ') : String(v ?? '—')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ── Image preview strip ── */
const ImagePreviews = ({ files }) => {
  if (!files || files.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {Array.from(files).map((f, i) => (
        <img key={i} src={URL.createObjectURL(f)} alt={`preview ${i}`}
             className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
      ))}
      <span className="text-xs text-gray-400 self-center">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
    </div>
  );
};

/* ── Existing images strip with remove buttons ── */
const ExistingImages = ({ images, onRemove }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {images.map((img, i) => (
        <div key={i} className="relative group">
          <img src={imageUrl(img)} alt={`existing ${i}`}
               className="w-16 h-12 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label="Remove image"
            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
          >×</button>
        </div>
      ))}
      <span className="text-xs text-gray-400 self-center">{images.length} existing</span>
    </div>
  );
};

/* ════════════════════════════════════════════
   ADMIN PORTAL — MAIN COMPONENT
═══════════════════════════════════════════ */
const AdminPortal = () => {
  const navigate = useNavigate();

  /* ── UI ── */
  const [activeTab,   setActiveTab]   = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search,      setSearch]      = useState('');
  const [modalData,   setModalData]   = useState(null);
  const [modalTitle,  setModalTitle]  = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [regFilter,   setRegFilter]   = useState('all');

  /* ── Data ── */
  const [contacts,      setContacts]      = useState([]);
  const [quotes,        setQuotes]        = useState([]);
  const [projects,      setProjects]      = useState([]);
  const [users,         setUsers]         = useState([]);
  const [blogs,         setBlogs]         = useState([]);
  const [careers,       setCareers]       = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [testimonials,  setTestimonials]  = useState([]);
  const [modules,       setModules]       = useState([]);
  const [certRequests,  setCertRequests]  = useState([]);
  const [certUploadingId, setCertUploadingId] = useState(null); // ID of cert being uploaded
  const [certUploadMsg,   setCertUploadMsg]   = useState({ id: null, type: '', text: '' }); // {id, type:'success'|'error', text}
  const [clients,       setClients]       = useState([]);
  const [clientQueries, setClientQueries] = useState([]);
  const [jobs,          setJobs]          = useState([]);
  const [pendingClients,setPendingClients]= useState([]);
  const [emailLogs,     setEmailLogs]     = useState([]);
  const [emailLogsTotal, setEmailLogsTotal] = useState(0);

  /* ── Job form ── */
  const [showJobForm,  setShowJobForm]  = useState(false);
  const [editingJob,   setEditingJob]   = useState(null);
  const [jobForm, setJobForm] = useState({ title:'', department:'', location:'', type:'full-time', description:'', status:'active' });
  const [jobMsg,       setJobMsg]       = useState('');

  /* ── Client approval ── */
  const [approvalNotes, setApprovalNotes] = useState({});
  const [selectedClient, setSelectedClient] = useState(null); // client being managed
  const [clientProject,  setClientProject]  = useState(null);
  const [clientProjectLoading, setClientProjectLoading] = useState(false);
  const [clientUploadMsg, setClientUploadMsg] = useState('');
  const [clientReplyText, setClientReplyText] = useState({});

  /* ── Module form ── */
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule,  setEditingModule]  = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '', description: '', content: '', duration: '30 min', order: 0, passMark: 60, published: true
  });
  const [quizQuestions, setQuizQuestions] = useState([]); // [{question,options:[4],correctIndex,explanation}]
  const [moduleMsg,     setModuleMsg]     = useState('');

  /* ── Project form ── */
  const [showProjectForm,    setShowProjectForm]    = useState(false);
  const [editingProject,     setEditingProject]     = useState(null);
  const [projectForm,        setProjectForm]        = useState({ title: '', description: '', location: '', year: String(new Date().getFullYear()), category: 'residential' });
  const [projectImages,      setProjectImages]      = useState(null); // FileList
  const [existingImages,     setExistingImages]     = useState([]);   // current saved filenames
  const [projectMsg,         setProjectMsg]         = useState({ t: '', text: '' });
  const projectFileRef = useRef(null);

  /* ── Blog form ── */
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog,  setEditingBlog]  = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: 'Er. Ramchandra P. More', category: '', published: false });
  const [blogImage, setBlogImage] = useState(null);
  const [blogMsg,   setBlogMsg]   = useState({ t: '', text: '' });

  /* ── Testimonial form ── */
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial,  setEditingTestimonial]  = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', category: 'client', designation: '', text: '', published: true });
  const [testimonialPhoto, setTestimonialPhoto] = useState(null);
  const [testimonialMsg,   setTestimonialMsg]   = useState({ t: '', text: '' });

  const adminUser = getUser();

  /* ── Auth guard ── */
  useEffect(() => {
    if (!getToken() || getUser()?.role !== 'admin') navigate('/admin-login');
  }, [navigate]);

  /* ── Fetch all ── */
  const fetchAll = useCallback(async () => {
    setLoadingData(true);
    try {
      const [cR, qR, pR, uR, bR, crR, rR, tR, mR, certR, clR, clqR, jR, pcR, elR] = await Promise.all([
        fetch(`${API_BASE_URL}/contact`,                    { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/quotes`,                     { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/projects`,                   { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/auth/users`,                 { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/blog`,                       { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/careers`,                    { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/registrations`,              { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/testimonials/all`,           { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/modules`,                    { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/modules/cert-requests`,      { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/clients`,                    { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/clients/queries`,            { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/jobs`,                       { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/clients?pending=true`,       { headers: bearerHdr() }),
        fetch(`${API_BASE_URL}/email-logs?limit=100`,       { headers: bearerHdr() }),
      ]);
      const [cD,qD,pD,uD,bD,crD,rD,tD,mD,certD,clD,clqD,jD,pcD,elD] = await Promise.all([
        cR.json(), qR.json(), pR.json(),
        uR.ok ? uR.json() : { data: [] },
        bR.json(), crR.json(),
        rR.ok    ? rR.json()    : { data: [] },
        tR.ok    ? tR.json()    : { data: [] },
        mR.ok    ? mR.json()    : { data: [] },
        certR.ok ? certR.json() : { data: [] },
        clR.ok   ? clR.json()   : { data: [] },
        clqR.ok  ? clqR.json()  : { data: [] },
        jR.ok    ? jR.json()    : { data: [] },
        pcR.ok   ? pcR.json()   : { data: [] },
        elR.ok   ? elR.json()   : { data: [], total: 0 },
      ]);
      setContacts(cD.data        || []);
      setQuotes(qD.data          || []);
      setProjects(pD.data        || []);
      setUsers(uD.data           || []);
      setBlogs(bD.data           || []);
      setCareers(crD.data        || []);
      setRegistrations(rD.data   || []);
      setTestimonials(tD.data    || []);
      setModules(mD.data         || []);
      setCertRequests(certD.data || []);
      setClients(clD.data        || []);
      setClientQueries(clqD.data || []);
      setJobs(jD.data            || []);
      setPendingClients(pcD.data || []);
      setEmailLogs(elD.data      || []);
      setEmailLogsTotal(elD.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoadingData(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Generic delete ── */
  const deleteItem = async (endpoint, id) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE', headers: jsonHdr() });
    fetchAll();
  };

  /* ── Registration status ── */
  const updateRegStatus = async (id, status) => {
    await fetch(`${API_BASE_URL}/registrations/${id}/status`, { method: 'PUT', headers: jsonHdr(), body: JSON.stringify({ status }) });
    setRegistrations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
  };

  /* ── Open project edit ── */
  const openEditProject = (p) => {
    setEditingProject(p);
    setProjectForm({ title: p.title, description: p.description, location: p.location, year: p.year, category: p.category });
    setExistingImages(p.images?.length > 0 ? [...p.images] : p.image ? [p.image] : []);
    setProjectImages(null);
    if (projectFileRef.current) projectFileRef.current.value = '';
    setShowProjectForm(true);
  };

  const resetProjectForm = () => {
    setEditingProject(null);
    setProjectForm({ title: '', description: '', location: '', year: String(new Date().getFullYear()), category: 'residential' });
    setExistingImages([]);
    setProjectImages(null);
    if (projectFileRef.current) projectFileRef.current.value = '';
    setShowProjectForm(false);
  };

  /* ── Submit project ── */
  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(projectForm).forEach(([k, v]) => fd.append(k, v));
    if (projectImages) {
      Array.from(projectImages).forEach(f => fd.append('images', f));
    }
    existingImages.forEach(img => fd.append('keepImages', img));

    const url    = editingProject ? `${API_BASE_URL}/projects/${editingProject._id}` : `${API_BASE_URL}/projects`;
    const method = editingProject ? 'PUT' : 'POST';
    try {
      const res    = await fetch(url, { method, headers: bearerHdr(), body: fd });
      const data   = await res.json();
      if (res.ok && data.success) {
        setProjectMsg({ t: 'ok', text: editingProject ? 'Project updated!' : 'Project added!' });
        resetProjectForm();
        fetchAll();
        setTimeout(() => setProjectMsg({ t: '', text: '' }), 4000);
      } else {
        setProjectMsg({ t: 'err', text: data.error || `Failed to ${editingProject ? 'update' : 'add'} project.` });
      }
    } catch (err) {
      console.error('Project submit error:', err);
      setProjectMsg({ t: 'err', text: 'Network error — could not reach server.' });
    }
  };

  /* ── Blog submit ── */
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(blogForm).forEach(([k, v]) => fd.append(k, v));
    if (blogImage) fd.append('image', blogImage);
    const url    = editingBlog ? `${API_BASE_URL}/blog/${editingBlog._id}` : `${API_BASE_URL}/blog`;
    const method = editingBlog ? 'PUT' : 'POST';
    try {
      const res    = await fetch(url, { method, headers: bearerHdr(), body: fd });
      const data   = await res.json();
      if (res.ok && data.success) {
        setBlogMsg({ t: 'ok', text: editingBlog ? 'Post updated!' : 'Post created!' });
        setShowBlogForm(false); setEditingBlog(null); setBlogImage(null);
        setBlogForm({ title: '', excerpt: '', content: '', author: 'Er. Ramchandra P. More', category: '', published: false });
        fetchAll(); setTimeout(() => setBlogMsg({ t: '', text: '' }), 4000);
      } else {
        setBlogMsg({ t: 'err', text: data.error || `Failed to ${editingBlog ? 'update' : 'create'} post.` });
      }
    } catch (err) {
      console.error('Blog submit error:', err);
      setBlogMsg({ t: 'err', text: 'Network error — could not reach server.' });
    }
  };

  /* ── Testimonial submit ── */
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(testimonialForm).forEach(([k, v]) => fd.append(k, v));
    if (testimonialPhoto) fd.append('photo', testimonialPhoto);
    const url    = editingTestimonial ? `${API_BASE_URL}/testimonials/${editingTestimonial._id}` : `${API_BASE_URL}/testimonials`;
    const method = editingTestimonial ? 'PUT' : 'POST';
    try {
      const res    = await fetch(url, { method, headers: bearerHdr(), body: fd });
      const data   = await res.json();
      if (res.ok && data.success) {
        setTestimonialMsg({ t: 'ok', text: editingTestimonial ? 'Testimonial updated!' : 'Testimonial added!' });
        setShowTestimonialForm(false); setEditingTestimonial(null); setTestimonialPhoto(null);
        setTestimonialForm({ name: '', category: 'client', designation: '', text: '', published: true });
        fetchAll(); setTimeout(() => setTestimonialMsg({ t: '', text: '' }), 4000);
      } else {
        setTestimonialMsg({ t: 'err', text: data.error || `Failed to ${editingTestimonial ? 'update' : 'add'} testimonial.` });
      }
    } catch (err) {
      console.error('Testimonial submit error:', err);
      setTestimonialMsg({ t: 'err', text: 'Network error — could not reach server.' });
    }
  };

  const openEditTestimonial = (t) => {
    setEditingTestimonial(t);
    setTestimonialForm({ name: t.name, category: t.category, designation: t.designation || '', text: t.text, published: t.published });
    setTestimonialPhoto(null);
    setShowTestimonialForm(true);
  };

  /* ── Module helpers ── */
  const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });

  const addQuestion    = () => setQuizQuestions(q => [...q, emptyQuestion()]);
  const removeQuestion = (i) => setQuizQuestions(q => q.filter((_, idx) => idx !== i));
  const updateQuestion = (i, field, val) =>
    setQuizQuestions(q => q.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  const updateOption   = (qi, oi, val) =>
    setQuizQuestions(q => q.map((item, idx) =>
      idx === qi ? { ...item, options: item.options.map((o, j) => j === oi ? val : o) } : item));

  const openEditModule = (m) => {
    setEditingModule(m);
    setModuleForm({
      title: m.title, description: m.description, content: m.content,
      duration: m.duration || '30 min', order: m.order ?? 0,
      passMark: m.passMark ?? 60, published: m.published
    });
    setQuizQuestions(m.quiz?.length > 0 ? m.quiz.map(q => ({
      question: q.question, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation || ''
    })) : []);
    setShowModuleForm(true);
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleForm({ title: '', description: '', content: '', duration: '30 min', order: 0, passMark: 60, published: true });
    setQuizQuestions([]);
    setShowModuleForm(false);
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...moduleForm, quiz: quizQuestions };
    const url    = editingModule ? `${API_BASE_URL}/modules/${editingModule._id}` : `${API_BASE_URL}/modules`;
    const method = editingModule ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: jsonHdr(), body: JSON.stringify(payload) });
    const data   = await res.json();
    if (data.success) {
      setModuleMsg(editingModule ? 'Module updated!' : 'Module created!');
      resetModuleForm();
      fetchAll();
      setTimeout(() => setModuleMsg(''), 3500);
    }
  };

  const updateCertStatus = async (id, status, adminNotes) => {
    await fetch(`${API_BASE_URL}/modules/cert-requests/${id}`, {
      method: 'PUT', headers: jsonHdr(), body: JSON.stringify({ status, adminNotes })
    });
    fetchAll();
  };

  /* ── Cert PDF upload ── */
  const handleCertPdfUpload = async (certId, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setCertUploadMsg({ id: certId, type: 'error', text: 'Only PDF files are allowed.' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setCertUploadMsg({ id: certId, type: 'error', text: 'File too large. Max 20MB.' });
      return;
    }
    setCertUploadingId(certId);
    setCertUploadMsg({ id: null, type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('pdf', file);
      const res  = await fetch(`${API_BASE_URL}/modules/cert-requests/${certId}/upload-pdf`, {
        method: 'PUT',
        headers: bearerHdr(),
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setCertUploadMsg({ id: certId, type: 'success', text: '✓ Certificate uploaded successfully!' });
        fetchAll();
      } else {
        setCertUploadMsg({ id: certId, type: 'error', text: data.error || 'Upload failed. Please try again.' });
      }
    } catch (err) {
      setCertUploadMsg({ id: certId, type: 'error', text: 'Network error — could not reach server. Check connection.' });
    } finally {
      setCertUploadingId(null);
    }
  };

  /* ── Job CRUD ── */
  const handleJobSubmit = async e => {
    e.preventDefault();
    const url    = editingJob ? `${API_BASE_URL}/jobs/${editingJob._id}` : `${API_BASE_URL}/jobs`;
    const method = editingJob ? 'PUT' : 'POST';
    const res    = await fetch(url, { method, headers: jsonHdr(), body: JSON.stringify(jobForm) });
    const data   = await res.json();
    if (data.success) {
      setJobMsg(editingJob ? 'Job updated!' : 'Job created!');
      setShowJobForm(false); setEditingJob(null);
      setJobForm({ title:'', department:'', location:'', type:'full-time', description:'', status:'active' });
      fetchAll(); setTimeout(() => setJobMsg(''), 3500);
    }
  };

  const openEditJob = job => {
    setEditingJob(job);
    setJobForm({ title: job.title, department: job.department, location: job.location, type: job.type, description: job.description, status: job.status });
    setShowJobForm(true);
  };

  /* ── Client approval ── */
  const handleClientApproval = async (clientId, action) => {
    const note = approvalNotes[clientId] || '';
    if (!window.confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this client registration?`)) return;
    const res  = await fetch(`${API_BASE_URL}/clients/${clientId}/approve`, {
      method: 'PUT', headers: jsonHdr(), body: JSON.stringify({ action, adminNote: note })
    });
    const data = await res.json();
    if (data.success) {
      setApprovalNotes(prev => { const n = {...prev}; delete n[clientId]; return n; });
      fetchAll();
    }
  };

  /* ── Helpers ── */
  const handleLogout     = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); navigate('/admin-login'); };
  const viewDetail       = (title, data) => { setModalTitle(title); setModalData(data); };
  const filterList       = (list, keys) => search ? list.filter(i => keys.some(k => String(i[k] || '').toLowerCase().includes(search.toLowerCase()))) : list;

  /* ── Client project helpers ── */
  const loadClientProject = async (clientId) => {
    setClientProjectLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/clients/${clientId}/project`, { headers: jsonHdr() });
      const data = await res.json();
      if (data.success) setClientProject(data.data);
    } catch (e) { console.error(e); }
    finally { setClientProjectLoading(false); }
  };

  const openClient = (client) => {
    setSelectedClient(client);
    loadClientProject(client._id);
  };

  const uploadClientFile = async (clientId, endpoint, fieldName, file, isMulti = false) => {
    const fd = new FormData();
    if (isMulti) {
      Array.from(file).forEach(f => fd.append(fieldName, f));
    } else {
      fd.append(fieldName, file);
    }
    const method = isMulti ? 'POST' : 'PUT';
    const res  = await fetch(`${API_BASE_URL}/clients/${clientId}/project/${endpoint}`, { method, headers: bearerHdr(), body: fd });
    const data = await res.json();
    if (data.success) {
      setClientProject(data.data);
      setClientUploadMsg('Uploaded successfully!');
      setTimeout(() => setClientUploadMsg(''), 3000);
    }
  };

  const deleteProgressImage = async (clientId, imageId) => {
    if (!window.confirm('Remove this image?')) return;
    const res  = await fetch(`${API_BASE_URL}/clients/${clientId}/project/progress/${imageId}`, { method: 'DELETE', headers: jsonHdr() });
    const data = await res.json();
    if (data.success) setClientProject(data.data);
  };

  const updateClientQueryReply = async (queryId, status, adminReply) => {
    await fetch(`${API_BASE_URL}/clients/queries/${queryId}`, { method: 'PUT', headers: jsonHdr(), body: JSON.stringify({ status, adminReply }) });
    fetchAll();
  };
  const allRequests      = [...contacts.map(c => ({ ...c, _rt: 'Enquiry', _sub: c.subject, _ep: 'contact' })), ...quotes.map(q => ({ ...q, _rt: 'Quote', _sub: q.projectType, _ep: 'quotes' }))].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredRegs     = registrations.filter(r => regFilter === 'all' || r.type === regFilter);
  const newBadge         = allRequests.length;
  const regBadge         = registrations.filter(r => r.status === 'new').length;

  const thCls  = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide';
  const tdCls  = 'px-4 py-3 text-sm';
  const rowCls = 'hover:bg-gray-50 transition';

  const navItems = [
    { id: 'dashboard',     label: 'Dashboard',    icon: <ChartBarIcon              className="h-5 w-5" /> },
    { id: 'requests',      label: 'Requests',     icon: <EnvelopeIcon              className="h-5 w-5" />, badge: newBadge },
    { id: 'registrations', label: 'Registrations',icon: <ClipboardDocumentListIcon className="h-5 w-5" />, badge: regBadge },
    { id: 'projects',      label: 'Projects',     icon: <BuildingOfficeIcon        className="h-5 w-5" /> },
    { id: 'training',      label: 'Training',     icon: <AcademicCapIcon           className="h-5 w-5" /> },
    { id: 'certificates',  label: 'Certificates', icon: <TrophyIcon               className="h-5 w-5" />, badge: certRequests.filter(r => r.status === 'pending').length },
    { id: 'testimonials',  label: 'Testimonials', icon: <ChatBubbleLeftEllipsisIcon className="h-5 w-5" /> },
    { id: 'blog',          label: 'Blog',         icon: <DocumentTextIcon          className="h-5 w-5" /> },
    { id: 'users',         label: 'Users',        icon: <UserGroupIcon             className="h-5 w-5" /> },
    { id: 'careers',       label: 'Careers',      icon: <BriefcaseIcon             className="h-5 w-5" /> },
    { id: 'job-listings',  label: 'Job Listings',  icon: <DocumentTextIcon          className="h-5 w-5" /> },
    { id: 'approvals',     label: 'Approvals',     icon: <CheckCircleIcon           className="h-5 w-5" />, badge: pendingClients.length },
    { id: 'clients',       label: 'Clients',       icon: <UserIcon                  className="h-5 w-5" />, badge: clientQueries.filter(q=>q.status==='new').length },
    { id: 'email-logs',    label: 'Email Logs',    icon: <EnvelopeIcon              className="h-5 w-5" /> },
  ];

  /* ════════════ RENDER ════════════ */
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: 'var(--font-primary, Lora, serif)' }}>

      {/* ── Sidebar ── */}
      <aside className={`flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`} style={{ background: '#1a0505' }}>
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {sidebarOpen && <img src={logo} alt="Nav Nirmiti" className="h-10 w-auto object-contain" style={{ filter: 'brightness(1.2)' }} />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'} className="text-gray-300 hover:text-white p-1 rounded transition ml-auto">
            {sidebarOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center"><ShieldCheckIcon className="h-4 w-4 text-white" /></div>
              <div>
                <p className="text-xs text-white font-semibold truncate">{adminUser?.name || 'Admin'}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{adminUser?.designation || 'Administrator'}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} title={!sidebarOpen ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-red-900 text-white border-r-2 border-red-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
              {sidebarOpen && item.badge > 0 && <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} title={!sidebarOpen ? 'Logout' : undefined}
          className="flex items-center gap-3 px-4 py-4 text-sm text-gray-300 hover:text-white hover:bg-red-900/40 transition border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}</h1>
            <p className="text-xs text-gray-400">Nav Nirmiti Admin Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 w-52" />
            </div>
            <div className="relative text-gray-400">
              <BellIcon className="h-5 w-5" />
              {(newBadge + regBadge) > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">{newBadge + regBadge}</span>}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loadingData && <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-800" /></div>}

          {/* ─── DASHBOARD ─── */}
          {activeTab === 'dashboard' && !loadingData && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<EnvelopeIcon              className="h-6 w-6 text-yellow-700" />} label="Requests"      value={allRequests.length}   color="bg-yellow-100" />
                <StatCard icon={<ClipboardDocumentListIcon className="h-6 w-6 text-blue-700"   />} label="Registrations" value={registrations.length} color="bg-blue-100"   />
                <StatCard icon={<BuildingOfficeIcon        className="h-6 w-6 text-green-700"  />} label="Projects"      value={projects.length}      color="bg-green-100"  />
                <StatCard icon={<ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-purple-700" />} label="Testimonials"  value={testimonials.length}  color="bg-purple-100" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Recent Requests</h3>
                  {allRequests.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.name} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${r._rt === 'Quote' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{r._rt}</span></p>
                        <p className="text-xs text-gray-400 truncate">{r._sub} · {r.email}</p>
                      </div>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {allRequests.length === 0 && <p className="text-sm text-gray-400 py-4">No requests yet.</p>}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Recent Registrations</h3>
                  {registrations.slice(0, 5).map(r => (
                    <div key={r._id} className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                        <p className="text-xs text-gray-400 truncate">{r.type} · {r.email}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}
                  {registrations.length === 0 && <p className="text-sm text-gray-400 py-4">No registrations yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── REQUESTS ─── */}
          {activeTab === 'requests' && !loadingData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-bold text-gray-800">All Requests ({allRequests.length})</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">Enquiries + Quotes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50"><tr>{['Type','Name','Email','Subject','Date','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filterList(allRequests, ['name','email','_sub']).map((r, i) => (
                      <tr key={i} className={rowCls}>
                        <td className={tdCls}><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${r._rt === 'Quote' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{r._rt}</span></td>
                        <td className={`${tdCls} font-medium text-gray-900`}>{r.name}</td>
                        <td className={`${tdCls} text-gray-500`}>{r.email}</td>
                        <td className={`${tdCls} text-gray-500 max-w-[160px] truncate`}>{r._sub}</td>
                        <td className={`${tdCls} text-gray-400 text-xs`}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className={tdCls}>
                          <div className="flex gap-2">
                            <button onClick={() => viewDetail(`${r._rt} Details`, r)} aria-label="View details" className="text-blue-600 hover:text-blue-800"><EyeIcon className="h-4 w-4" /></button>
                            <button onClick={() => deleteItem(r._ep, r._id)} aria-label="Delete" className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allRequests.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No requests yet.</p>}
              </div>
            </div>
          )}

          {/* ─── REGISTRATIONS ─── */}
          {activeTab === 'registrations' && !loadingData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
                <h2 className="font-bold text-gray-800">Registrations ({filteredRegs.length})</h2>
                <div className="flex gap-2">
                  {['all','student'].map(f => (
                    <button key={f} onClick={() => setRegFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${regFilter === f ? 'bg-red-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50"><tr>{['Name','Email','Phone','Type','City','State','Status','Date','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filterList(filteredRegs, ['name','email','type','city']).map(r => (
                      <tr key={r._id} className={rowCls}>
                        <td className={`${tdCls} font-medium text-gray-900`}>{r.name}</td>
                        <td className={`${tdCls} text-gray-500`}>{r.email}</td>
                        <td className={`${tdCls} text-gray-500`}>{r.phone}</td>
                        <td className={tdCls}><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${r.type === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{r.type}</span></td>
                        <td className={`${tdCls} text-gray-500`}>{r.city}</td>
                        <td className={`${tdCls} text-gray-500`}>{r.state}</td>
                        <td className={tdCls}>
                          <select value={r.status} onChange={e => updateRegStatus(r._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-800">
                            {['new','in_progress','reviewed','closed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                          </select>
                        </td>
                        <td className={`${tdCls} text-gray-400 text-xs`}>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className={tdCls}>
                          <div className="flex gap-2">
                            <button onClick={() => viewDetail('Registration', r)} aria-label="View details" className="text-blue-600 hover:text-blue-800"><EyeIcon className="h-4 w-4" /></button>
                            <button onClick={() => deleteItem('registrations', r._id)} aria-label="Delete" className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRegs.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No registrations found.</p>}
              </div>
            </div>
          )}

          {/* ─── PROJECTS ─── */}
          {activeTab === 'projects' && !loadingData && (
            <div className="space-y-4">
              {projectMsg.text && (
                <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${
                  projectMsg.t === 'ok'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  {projectMsg.t === 'ok' ? <CheckCircleIcon className="h-4 w-4" /> : <span className="font-bold">!</span>}
                  <span className="whitespace-pre-wrap">{projectMsg.text}</span>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Projects ({projects.length})</h2>
                  <button onClick={() => { if (showProjectForm && !editingProject) { resetProjectForm(); } else { resetProjectForm(); setShowProjectForm(true); } }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition" style={{ background: '#450a0a' }}>
                    <PlusIcon className="h-4 w-4" />
                    {showProjectForm && !editingProject ? 'Cancel' : 'Upload Project'}
                  </button>
                </div>

                {/* Project form */}
                {showProjectForm && (
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">{editingProject ? 'Edit Project' : 'Upload New Project'}</h3>
                    <form onSubmit={handleProjectSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                          <input required value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="Project title" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Location *</label>
                          <input required value={projectForm.location} onChange={e => setProjectForm({...projectForm, location: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="e.g. Miraj, Maharashtra" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Year *</label>
                          <input required value={projectForm.year} onChange={e => setProjectForm({...projectForm, year: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="2024" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                          <select value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800">
                            {['residential','commercial','interior','hotel','infrastructure'].map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                        <textarea required rows={3} value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="Describe the project..." />
                      </div>

                      {/* Multi-image upload */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Project Images / Videos{' '}
                          {editingProject
                            ? '(upload new ones to add to the gallery)'
                            : '(up to 10 items · images 25MB · videos 250MB)'}
                        </label>
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center hover:border-red-400 transition cursor-pointer bg-white"
                          onClick={() => projectFileRef.current?.click()}
                        >
                          <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to select images / videos or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, WebP, GIF · MP4, WebM, MOV · max 10 files · images 25MB, videos 250MB
                          </p>
                          <input
                            ref={projectFileRef}
                            type="file"
                            accept="image/*,video/*,application/pdf"
                            multiple
                            className="hidden"
                            onChange={e => setProjectImages(e.target.files)}
                          />
                        </div>
                        {/* New file previews */}
                        <ImagePreviews files={projectImages} />
                        {/* Existing images (edit mode) */}
                        {editingProject && existingImages.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Current images (click × to remove):</p>
                            <ExistingImages
                              images={existingImages}
                              onRemove={idx => setExistingImages(prev => prev.filter((_, i) => i !== idx))}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 text-white text-sm font-medium rounded-lg transition" style={{ background: '#450a0a' }}>
                          {editingProject ? 'Save Changes' : 'Upload Project'}
                        </button>
                        {editingProject && (
                          <button type="button" onClick={resetProjectForm} className="px-6 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Projects table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50"><tr>{['Images','Title','Category','Location','Year','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {filterList(projects, ['title','category','location']).map(p => {
                        const imgs = p.images?.length > 0 ? p.images : p.image ? [p.image] : [];
                        return (
                          <tr key={p._id} className={rowCls}>
                            <td className={tdCls}>
                              <div className="flex items-center gap-1">
                                {imgs.slice(0, 3).map((img, i) => (
                                  <img key={i} src={imageUrl(img)} alt="" className="w-10 h-8 object-cover rounded" />
                                ))}
                                {imgs.length > 3 && <span className="text-xs text-gray-400">+{imgs.length - 3}</span>}
                                {imgs.length === 0 && <PhotoIcon className="h-8 w-8 text-gray-300" />}
                              </div>
                            </td>
                            <td className={`${tdCls} font-medium text-gray-900 max-w-[180px] truncate`}>{p.title}</td>
                            <td className={`${tdCls} text-gray-500 capitalize`}>{p.category}</td>
                            <td className={`${tdCls} text-gray-500`}>{p.location}</td>
                            <td className={`${tdCls} text-gray-500`}>{p.year}</td>
                            <td className={tdCls}>
                              <div className="flex gap-2">
                                <button onClick={() => openEditProject(p)} className="text-blue-600 hover:text-blue-800" title="Edit" aria-label="Edit project"><PencilIcon className="h-4 w-4" /></button>
                                <button onClick={() => deleteItem('projects', p._id)} className="text-red-500 hover:text-red-700" title="Delete" aria-label="Delete project"><TrashIcon className="h-4 w-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {projects.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No projects yet. Upload your first project above.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── TESTIMONIALS ─── */}
          {activeTab === 'testimonials' && !loadingData && (
            <div className="space-y-4">
              {testimonialMsg.text && (
                <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${
                  testimonialMsg.t === 'ok'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  {testimonialMsg.t === 'ok' ? <CheckCircleIcon className="h-4 w-4" /> : <span className="font-bold">!</span>}
                  <span className="whitespace-pre-wrap">{testimonialMsg.text}</span>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Testimonials ({testimonials.length})</h2>
                  <button
                    onClick={() => {
                      if (showTestimonialForm && !editingTestimonial) { setShowTestimonialForm(false); return; }
                      setEditingTestimonial(null);
                      setTestimonialForm({ name: '', category: 'client', designation: '', text: '', published: true });
                      setTestimonialPhoto(null);
                      setShowTestimonialForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition" style={{ background: '#450a0a' }}>
                    <PlusIcon className="h-4 w-4" />
                    {showTestimonialForm && !editingTestimonial ? 'Cancel' : 'Add Testimonial'}
                  </button>
                </div>

                {/* Testimonial form */}
                {showTestimonialForm && (
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h3>
                    <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                          <input required value={testimonialForm.name} onChange={e => setTestimonialForm({...testimonialForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="Name of the person" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label>
                          <select value={testimonialForm.category} onChange={e => setTestimonialForm({...testimonialForm, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800">
                            <option value="client">Client</option>
                            <option value="student">Student</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Designation / Role</label>
                          <input value={testimonialForm.designation} onChange={e => setTestimonialForm({...testimonialForm, designation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="e.g. Homeowner, Civil Intern" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Photo (optional)</label>
                          <input type="file" accept="image/*" onChange={e => setTestimonialPhoto(e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
                          {testimonialPhoto && <p className="text-xs text-gray-400 mt-1">Selected: {testimonialPhoto.name}</p>}
                          {editingTestimonial?.photo && !testimonialPhoto && <p className="text-xs text-gray-400 mt-1">Current: {editingTestimonial.photo}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Testimonial Text *</label>
                        <textarea required rows={4} value={testimonialForm.text} onChange={e => setTestimonialForm({...testimonialForm, text: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="Write the testimonial here…" />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600">Published</span>
                        <button type="button" onClick={() => setTestimonialForm({...testimonialForm, published: !testimonialForm.published})}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${testimonialForm.published ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${testimonialForm.published ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs text-gray-400">{testimonialForm.published ? 'Visible on site' : 'Hidden'}</span>
                      </div>

                      <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 text-white text-sm font-medium rounded-lg transition" style={{ background: '#450a0a' }}>
                          {editingTestimonial ? 'Save Changes' : 'Add Testimonial'}
                        </button>
                        {editingTestimonial && (
                          <button type="button" onClick={() => { setShowTestimonialForm(false); setEditingTestimonial(null); }}
                            className="px-6 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition">Cancel</button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Testimonials table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50"><tr>{['Photo','Name','Category','Designation','Text','Status','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {filterList(testimonials, ['name','category','text']).map(t => (
                        <tr key={t._id} className={rowCls}>
                          <td className={tdCls}>
                            {t.photo
                              ? <img src={imageUrl(t.photo)} alt={t.name} className="w-10 h-10 object-cover rounded-full" />
                              : <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm">{t.name?.charAt(0)}</div>
                            }
                          </td>
                          <td className={`${tdCls} font-medium text-gray-900`}>{t.name}</td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${t.category === 'client' ? 'bg-amber-100 text-amber-800' : t.category === 'employee' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                              {t.category}
                            </span>
                          </td>
                          <td className={`${tdCls} text-gray-500 text-xs`}>{t.designation || '—'}</td>
                          <td className={`${tdCls} text-gray-500 max-w-[200px]`}>
                            <p className="truncate text-xs" title={t.text}>"{t.text}"</p>
                          </td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${t.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {t.published ? 'Live' : 'Hidden'}
                            </span>
                          </td>
                          <td className={tdCls}>
                            <div className="flex gap-2">
                              <button onClick={() => openEditTestimonial(t)} className="text-blue-600 hover:text-blue-800" title="Edit" aria-label="Edit testimonial"><PencilIcon className="h-4 w-4" /></button>
                              <button onClick={() => deleteItem('testimonials', t._id)} className="text-red-500 hover:text-red-700" title="Delete" aria-label="Delete testimonial"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {testimonials.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No testimonials yet. Add your first one above.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── BLOG ─── */}
          {activeTab === 'blog' && !loadingData && (
            <div className="space-y-4">
              {blogMsg.text && (
                <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 border ${
                  blogMsg.t === 'ok'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  {blogMsg.t === 'ok' ? <CheckCircleIcon className="h-4 w-4" /> : <span className="font-bold">!</span>}
                  <span className="whitespace-pre-wrap">{blogMsg.text}</span>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Blog Posts ({blogs.length})</h2>
                  <button onClick={() => { if (showBlogForm && !editingBlog) { setShowBlogForm(false); return; } setEditingBlog(null); setBlogForm({ title:'',excerpt:'',content:'',author:'Er. Ramchandra P. More',category:'',published:false }); setBlogImage(null); setShowBlogForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition" style={{ background: '#450a0a' }}>
                    <PlusIcon className="h-4 w-4" />{showBlogForm && !editingBlog ? 'Cancel' : 'New Post'}
                  </button>
                </div>
                {showBlogForm && (
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                    <form onSubmit={handleBlogSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label><input required value={blogForm.title} onChange={e => setBlogForm({...blogForm, title:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Author *</label><input required value={blogForm.author} onChange={e => setBlogForm({...blogForm, author:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Category *</label><input required value={blogForm.category} onChange={e => setBlogForm({...blogForm, category:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" /></div>
                        <div><label className="block text-xs font-semibold text-gray-600 mb-1">Cover Image</label><input type="file" accept="image/*" onChange={e => setBlogImage(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" /></div>
                      </div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Excerpt *</label><textarea required rows={2} value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" /></div>
                      <div><label className="block text-xs font-semibold text-gray-600 mb-1">Content *</label><textarea required rows={6} value={blogForm.content} onChange={e => setBlogForm({...blogForm, content:e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" /></div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600">Published</span>
                        <button type="button" onClick={() => setBlogForm({...blogForm, published:!blogForm.published})} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${blogForm.published ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${blogForm.published ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs text-gray-400">{blogForm.published ? 'Live' : 'Draft'}</span>
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 text-white text-sm font-medium rounded-lg" style={{ background: '#450a0a' }}>{editingBlog ? 'Save Changes' : 'Publish Post'}</button>
                        {editingBlog && <button type="button" onClick={() => { setShowBlogForm(false); setEditingBlog(null); }} className="px-6 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50">Cancel</button>}
                      </div>
                    </form>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50"><tr>{['Image','Title','Author','Category','Status','Date','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {filterList(blogs, ['title','author','category']).map(b => (
                        <tr key={b._id} className={rowCls}>
                          <td className={tdCls}>{b.image ? <img src={imageUrl(b.image)} alt="" className="w-12 h-10 object-cover rounded" /> : <PhotoIcon className="h-8 w-8 text-gray-300" />}</td>
                          <td className={`${tdCls} font-medium text-gray-900 max-w-[160px] truncate`}>{b.title}</td>
                          <td className={`${tdCls} text-gray-500`}>{b.author}</td>
                          <td className={`${tdCls} text-gray-500`}>{b.category}</td>
                          <td className={tdCls}><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${b.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.published ? 'Published' : 'Draft'}</span></td>
                          <td className={`${tdCls} text-gray-400 text-xs`}>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td className={tdCls}>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingBlog(b); setBlogForm({title:b.title,excerpt:b.excerpt,content:b.content,author:b.author,category:b.category,published:b.published}); setBlogImage(null); setShowBlogForm(true); }} aria-label="Edit post" className="text-blue-600 hover:text-blue-800"><PencilIcon className="h-4 w-4" /></button>
                              <button onClick={() => deleteItem('blog', b._id)} aria-label="Delete post" className="text-red-500 hover:text-red-700"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {blogs.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No blog posts yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── USERS ─── */}
          {activeTab === 'users' && !loadingData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b"><h2 className="font-bold text-gray-800">Users ({users.length})</h2></div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50"><tr>{['Name','Email','Role','Joined','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filterList(users, ['name','email','role']).map(u => (
                      <tr key={u._id} className={rowCls}>
                        <td className={`${tdCls} font-medium text-gray-900`}>{u.name}</td>
                        <td className={`${tdCls} text-gray-500`}>{u.email}</td>
                        <td className={tdCls}><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${u.role==='admin'?'bg-red-100 text-red-700':u.role==='student'?'bg-blue-100 text-blue-700':u.role==='client'?'bg-amber-100 text-amber-700':'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                        <td className={`${tdCls} text-gray-400 text-xs`}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className={tdCls}><button onClick={() => viewDetail('User Details', u)} aria-label="View user" className="text-blue-600 hover:text-blue-800"><EyeIcon className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No users yet.</p>}
              </div>
            </div>
          )}

          {/* ─── CAREERS ─── */}
          {activeTab === 'careers' && !loadingData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b"><h2 className="font-bold text-gray-800">Career Listings ({careers.length})</h2></div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50"><tr>{['Title','Department','Location','Type','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr></thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {filterList(careers, ['title','department','location']).map(c => (
                      <tr key={c._id} className={rowCls}>
                        <td className={`${tdCls} font-medium text-gray-900`}>{c.title}</td>
                        <td className={`${tdCls} text-gray-500`}>{c.department||'—'}</td>
                        <td className={`${tdCls} text-gray-500`}>{c.location||'—'}</td>
                        <td className={`${tdCls} text-gray-500`}>{c.type||'—'}</td>
                        <td className={tdCls}><button onClick={() => viewDetail('Career Listing', c)} aria-label="View career listing" className="text-blue-600 hover:text-blue-800"><EyeIcon className="h-4 w-4" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {careers.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No career listings yet.</p>}
              </div>
            </div>
          )}

          {/* ─── JOB LISTINGS ─── */}
          {activeTab === 'job-listings' && !loadingData && (
            <div className="space-y-4">
              {jobMsg && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />{jobMsg}
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">Job Listings ({jobs.length})</h2>
                  <button
                    onClick={() => {
                      if (showJobForm && !editingJob) { setShowJobForm(false); return; }
                      setEditingJob(null);
                      setJobForm({ title:'', department:'', location:'', type:'full-time', description:'', status:'active' });
                      setShowJobForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition" style={{ background: '#450a0a' }}>
                    <PlusIcon className="h-4 w-4" />
                    {showJobForm && !editingJob ? 'Cancel' : 'Add Job'}
                  </button>
                </div>

                {/* Job form */}
                {showJobForm && (
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">{editingJob ? 'Edit Job Listing' : 'Create Job Listing'}</h3>
                    <form onSubmit={handleJobSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title *</label>
                          <input required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                            placeholder="e.g. Site Engineer" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Department *</label>
                          <input required value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                            placeholder="e.g. Engineering" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Location *</label>
                          <input required value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                            placeholder="e.g. Miraj, Maharashtra" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Job Type *</label>
                          <select value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800">
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="internship">Internship</option>
                            <option value="contract">Contract</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                          <select value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800">
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                        <textarea required rows={4} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                          placeholder="Describe the role, responsibilities, and requirements…" />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 text-white text-sm font-medium rounded-lg transition" style={{ background: '#450a0a' }}>
                          {editingJob ? 'Save Changes' : 'Publish Job'}
                        </button>
                        {editingJob && (
                          <button type="button" onClick={() => { setShowJobForm(false); setEditingJob(null); }}
                            className="px-6 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Jobs table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>{['Title','Department','Location','Type','Status','Posted','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {jobs.map(j => (
                        <tr key={j._id} className={rowCls}>
                          <td className={`${tdCls} font-medium text-gray-900`}>{j.title}</td>
                          <td className={`${tdCls} text-gray-500`}>{j.department}</td>
                          <td className={`${tdCls} text-gray-500`}>{j.location}</td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                              j.type==='full-time' ? 'bg-blue-100 text-blue-700' :
                              j.type==='internship' ? 'bg-green-100 text-green-700' :
                              j.type==='part-time' ? 'bg-amber-100 text-amber-700' :
                              'bg-purple-100 text-purple-700'}`}>
                              {j.type.replace('-',' ')}
                            </span>
                          </td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${j.status==='active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {j.status}
                            </span>
                          </td>
                          <td className={`${tdCls} text-gray-400 text-xs`}>{new Date(j.createdAt).toLocaleDateString()}</td>
                          <td className={tdCls}>
                            <div className="flex gap-2">
                              <button onClick={() => openEditJob(j)} className="text-blue-600 hover:text-blue-800" title="Edit" aria-label="Edit job"><PencilIcon className="h-4 w-4" /></button>
                              <button onClick={() => deleteItem('jobs', j._id)} className="text-red-500 hover:text-red-700" title="Delete" aria-label="Delete job"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {jobs.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No job listings yet. Click "Add Job" to create one — it will appear live on the Careers page immediately.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── PENDING CLIENT APPROVALS ─── */}
          {activeTab === 'approvals' && !loadingData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Pending',  value: pendingClients.length,                                          color: 'bg-yellow-100' },
                  { label: 'Approved', value: clients.filter(c => c.isApproved).length,                       color: 'bg-green-100'  },
                  { label: 'Total',    value: clients.length,                                                  color: 'bg-gray-100'   },
                ].map((s,i) => (
                  <div key={i} className={`${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Pending Client Registrations ({pendingClients.length})</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Review each registration and approve or reject. Client will be notified by email.</p>
                </div>

                {pendingClients.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">All caught up — no pending approvals.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pendingClients.map(cl => (
                      <div key={cl._id} className="px-6 py-5">
                        <div className="flex flex-col md:flex-row md:items-start gap-5 justify-between">
                          {/* Client info */}
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {cl.profilePhoto
                              ? <img src={fileUrl(cl.profilePhoto)} alt={cl.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-200" />
                              : <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-xl flex-shrink-0">{cl.name?.charAt(0)}</div>
                            }
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900">{cl.name}</p>
                              <p className="text-sm text-gray-500">{cl.email}</p>
                              <p className="text-sm text-gray-500">{cl.phone}</p>
                              {cl.address && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{cl.address}</p>}
                              <p className="text-xs text-gray-400 mt-1">Registered: {new Date(cl.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                            </div>
                          </div>

                          {/* Payment screenshot */}
                          {cl.paymentScreenshot && (
                            <div className="flex-shrink-0">
                              <p className="text-xs font-semibold text-gray-500 mb-1">Payment Screenshot</p>
                              <a href={fileUrl(cl.paymentScreenshot)} target="_blank" rel="noopener noreferrer">
                                <img src={fileUrl(cl.paymentScreenshot)} alt="Payment proof"
                                  className="w-32 h-24 object-cover rounded-xl border border-gray-200 shadow-sm hover:opacity-90 transition cursor-pointer" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Admin note + action buttons */}
                        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <input
                            type="text"
                            placeholder="Optional note to client…"
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800"
                            value={approvalNotes[cl._id] || ''}
                            onChange={e => setApprovalNotes(prev => ({ ...prev, [cl._id]: e.target.value }))}
                          />
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleClientApproval(cl._id, 'approve')}
                              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-full transition"
                              style={{ background: '#16a34a' }}>
                              <CheckCircleIcon className="h-4 w-4" /> Approve
                            </button>
                            <button
                              onClick={() => handleClientApproval(cl._id, 'reject')}
                              className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-full transition bg-red-600 hover:bg-red-700">
                              <TrashIcon className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── TRAINING MODULES ─── */}
          {activeTab === 'training' && !loadingData && (
            <div className="space-y-4">
              {moduleMsg && (
                <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4 flex-shrink-0" />{moduleMsg}
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-gray-800">Training Modules ({modules.length})</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Modules are displayed to students in order. Each module can have a quiz.</p>
                  </div>
                  <button
                    onClick={() => { if (showModuleForm && !editingModule) { resetModuleForm(); } else { resetModuleForm(); setShowModuleForm(true); } }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition" style={{ background: '#450a0a' }}>
                    <PlusIcon className="h-4 w-4" />
                    {showModuleForm && !editingModule ? 'Cancel' : 'Add Module'}
                  </button>
                </div>

                {/* Module form */}
                {showModuleForm && (
                  <div className="px-6 py-5 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4">{editingModule ? 'Edit Module' : 'Create New Module'}</h3>
                    <form onSubmit={handleModuleSubmit} className="space-y-5">
                      {/* Basic fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                          <input required value={moduleForm.title} onChange={e => setModuleForm({...moduleForm,title:e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="e.g. Construction Basics" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                          <input value={moduleForm.duration} onChange={e => setModuleForm({...moduleForm,duration:e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="e.g. 45 min" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Display Order</label>
                          <input type="number" value={moduleForm.order} onChange={e => setModuleForm({...moduleForm,order:parseInt(e.target.value)||0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Quiz Pass Mark (%)</label>
                          <input type="number" min="0" max="100" value={moduleForm.passMark} onChange={e => setModuleForm({...moduleForm,passMark:parseInt(e.target.value)||60})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                        <input required value={moduleForm.description} onChange={e => setModuleForm({...moduleForm,description:e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800" placeholder="Short summary shown in the module list" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Module Content *  <span className="font-normal text-gray-400">(theory text shown to students)</span></label>
                        <textarea required rows={8} value={moduleForm.content} onChange={e => setModuleForm({...moduleForm,content:e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-800 font-mono"
                          placeholder="Full module content — students read this before taking the quiz…" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-600">Published</span>
                        <button type="button" onClick={() => setModuleForm({...moduleForm,published:!moduleForm.published})}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${moduleForm.published?'bg-green-500':'bg-gray-300'}`}>
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${moduleForm.published?'translate-x-4':'translate-x-1'}`} />
                        </button>
                        <span className="text-xs text-gray-400">{moduleForm.published?'Visible to students':'Hidden'}</span>
                      </div>

                      {/* Quiz builder */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-700">Quiz Questions ({quizQuestions.length})</h4>
                          <button type="button" onClick={addQuestion}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 text-white rounded-lg transition" style={{background:'#450a0a'}}>
                            <PlusIcon className="h-3.5 w-3.5" /> Add Question
                          </button>
                        </div>
                        {quizQuestions.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-5">No questions yet. Click "Add Question" to create a quiz for this module.</p>
                        )}
                        {quizQuestions.map((q, qi) => (
                          <div key={qi} className="p-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-gray-600 uppercase">Question {qi+1}</span>
                              <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                            </div>
                            <input value={q.question} onChange={e => updateQuestion(qi,'question',e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-800"
                              placeholder="Question text *" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              {q.options.map((opt,oi) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <input type="radio" name={`correct-${qi}`} checked={q.correctIndex===oi}
                                    onChange={() => updateQuestion(qi,'correctIndex',oi)}
                                    title="Mark as correct answer" className="accent-green-600 flex-shrink-0" />
                                  <input value={opt} onChange={e => updateOption(qi,oi,e.target.value)}
                                    className={`flex-1 px-3 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 ${q.correctIndex===oi?'border-green-400 bg-green-50 focus:ring-green-400':'border-gray-300 focus:ring-red-800'}`}
                                    placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-400 mb-2">🔘 Radio = correct answer</p>
                            <input value={q.explanation} onChange={e => updateQuestion(qi,'explanation',e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-gray-400"
                              placeholder="Explanation shown after answer (optional)" />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 text-white text-sm font-medium rounded-lg transition" style={{background:'#450a0a'}}>
                          {editingModule ? 'Save Changes' : 'Create Module'}
                        </button>
                        {editingModule && (
                          <button type="button" onClick={resetModuleForm} className="px-6 py-2 text-gray-600 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}

                {/* Module table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>{['#','Title','Duration','Quiz Qs','Pass Mark','Status','Actions'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {modules.map((m,i) => (
                        <tr key={m._id} className={rowCls}>
                          <td className={`${tdCls} text-gray-400 font-mono`}>{m.order ?? i+1}</td>
                          <td className={tdCls}>
                            <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[220px]">{m.description}</p>
                          </td>
                          <td className={`${tdCls} text-gray-500`}>{m.duration || '—'}</td>
                          <td className={`${tdCls} text-gray-500`}>{m.quiz?.length || 0}</td>
                          <td className={`${tdCls} text-gray-500`}>{m.passMark}%</td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${m.published?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                              {m.published?'Live':'Hidden'}
                            </span>
                          </td>
                          <td className={tdCls}>
                            <div className="flex gap-2">
                              <button onClick={() => openEditModule(m)} className="text-blue-600 hover:text-blue-800" title="Edit" aria-label="Edit module"><PencilIcon className="h-4 w-4" /></button>
                              <button onClick={() => deleteItem('modules', m._id)} className="text-red-500 hover:text-red-700" title="Delete" aria-label="Delete module"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {modules.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No modules yet. Create your first training module above.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── CERTIFICATES ─── */}
          {activeTab === 'certificates' && !loadingData && (
            <div className="space-y-4">
              {certUploadMsg.text && certUploadMsg.id === null && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${certUploadMsg.type === 'success' ? 'bg-green-50 border border-green-300 text-green-700' : 'bg-red-50 border border-red-300 text-red-700'}`}>
                  {certUploadMsg.text}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total',    value: certRequests.length,                                    color: 'bg-gray-100'   },
                  { label: 'Pending',  value: certRequests.filter(r=>r.status==='pending').length,    color: 'bg-yellow-100' },
                  { label: 'Approved', value: certRequests.filter(r=>r.status==='approved').length,   color: 'bg-green-100'  },
                  { label: 'Issued',   value: certRequests.filter(r=>r.status==='issued').length,     color: 'bg-blue-100'   },
                ].map((s,i) => (
                  <div key={i} className={`${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-bold text-gray-800">Certificate Requests ({certRequests.length})</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Theory = online module completion · On-Site = physical training completion</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>{['Student','Login Email','Phone','Type','Modules','Date','Certificate PDF','Status','Actions'].map(h=><th key={h} className={thCls}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {certRequests.map(cr => (
                        <tr key={cr._id} className={rowCls}>
                          <td className={`${tdCls} font-semibold text-gray-900`}>{cr.studentName}</td>
                          <td className={`${tdCls} text-gray-500 text-xs`}>{cr.studentEmail}</td>
                          <td className={`${tdCls} text-gray-700 text-xs font-medium`}>{cr.certPhone}</td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${cr.type==='theory'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>
                              {cr.type === 'theory' ? '📚 Theory' : '🏗 On-Site'}
                            </span>
                          </td>
                          <td className={`${tdCls} text-xs text-gray-400`}>{cr.modulesCompleted?.length || 0}</td>
                          <td className={`${tdCls} text-xs text-gray-400`}>{new Date(cr.createdAt).toLocaleDateString()}</td>
                          <td className={tdCls}>
                            {certUploadMsg.id === cr._id && (
                              <p className={`text-xs mb-2 font-medium ${certUploadMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {certUploadMsg.text}
                              </p>
                            )}
                            {certUploadingId === cr._id ? (
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="animate-spin h-3.5 w-3.5 border-2 border-red-800 border-t-transparent rounded-full" />
                                Uploading…
                              </div>
                            ) : cr.certificatePdf ? (
                              <div className="flex items-center gap-2">
                                <a href={certPdfUrl(cr._id)}
                                  download={`certificate-${cr.studentName?.replace(/\s+/g,'-')}.pdf`}
                                  className="text-green-600 hover:text-green-800 text-xs font-semibold flex items-center gap-1">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                                  View PDF
                                </a>
                                <label className="cursor-pointer text-blue-500 hover:text-blue-700 text-xs font-medium" title="Replace PDF">
                                  ↺ Replace
                                  <input type="file" accept="application/pdf" className="hidden"
                                    onChange={e => handleCertPdfUpload(cr._id, e.target.files[0])} />
                                </label>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 text-white rounded-lg transition" style={{ background: '#450a0a' }}>
                                <CloudArrowUpIcon className="h-3.5 w-3.5" /> Upload PDF
                                <input type="file" accept="application/pdf" className="hidden"
                                  onChange={e => handleCertPdfUpload(cr._id, e.target.files[0])} />
                              </label>
                            )}
                          </td>
                          <td className={tdCls}>
                            <select value={cr.status}
                              onChange={e => updateCertStatus(cr._id, e.target.value, cr.adminNotes || '')}
                              className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-800 bg-white">
                              {['pending','approved','issued','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td className={tdCls}>
                            <button onClick={() => viewDetail('Certificate Request', cr)} aria-label="View certificate request" className="text-blue-600 hover:text-blue-800">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {certRequests.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No certificate requests yet.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── CLIENTS ─── */}
          {activeTab === 'clients' && !loadingData && (
            <div className="space-y-4">
              {!selectedClient ? (
                /* ── Client list ── */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800">Clients ({clients.length})</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {clientQueries.filter(q => q.status === 'new').length} new queries
                    </span>
                  </div>
                  {clients.length === 0 ? (
                    <p className="text-center py-12 text-gray-400 text-sm">No clients registered yet.</p>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {clients.map(cl => {
                        const pending = clientQueries.filter(q => q.client === cl._id && q.status === 'new').length;
                        return (
                          <div key={cl._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                              {cl.profilePhoto
                                ? <img src={fileUrl(cl.profilePhoto)} alt={cl.name} className="w-10 h-10 rounded-full object-cover" />
                                : <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">{cl.name?.charAt(0)}</div>
                              }
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{cl.name}</p>
                                <p className="text-xs text-gray-400">{cl.email} · {cl.phone || '—'}</p>
                                {cl.address && <p className="text-xs text-gray-400 truncate max-w-xs">{cl.address}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {pending > 0 && (
                                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{pending} new</span>
                              )}
                              <button
                                onClick={() => openClient(cl)}
                                className="px-4 py-2 text-xs font-semibold text-white rounded-lg transition"
                                style={{ background: '#450a0a' }}
                              >
                                Manage →
                              </button>
                              <button
                                onClick={() => deleteItem('clients', cl._id)}
                                className="px-3 py-2 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                                title="Delete client"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* ── Per-client project management ── */
                <div className="space-y-5">
                  {/* Back button + client header */}
                  <div className="flex items-center gap-4">
                    <button onClick={() => { setSelectedClient(null); setClientProject(null); }}
                      className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition">
                      ← Back to Clients
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    {selectedClient.profilePhoto
                      ? <img src={fileUrl(selectedClient.profilePhoto)} alt={selectedClient.name} className="w-14 h-14 rounded-full object-cover" />
                      : <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-xl">{selectedClient.name?.charAt(0)}</div>
                    }
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg">{selectedClient.name}</h2>
                      <p className="text-sm text-gray-500">{selectedClient.email} · {selectedClient.phone || '—'}</p>
                      {selectedClient.address && <p className="text-xs text-gray-400 mt-0.5">{selectedClient.address}</p>}
                    </div>
                  </div>

                  {clientUploadMsg && (
                    <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircleIcon className="h-4 w-4" /> {clientUploadMsg}
                    </div>
                  )}

                  {clientProjectLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Stage 1: Plan PDF */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          📋 Stage 1 — Plan
                          {clientProject?.planPdf && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Done</span>}
                        </h3>
                        {clientProject?.planPdf && (
                          <div className="mb-3 flex items-center gap-2">
                            <a href={fileUrl(clientProject.planPdf)} download className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                              <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Current PDF
                            </a>
                            <span className="text-xs text-gray-400">
                              · {clientProject.planUploadedAt ? new Date(clientProject.planUploadedAt).toLocaleDateString('en-IN') : ''}
                            </span>
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-white px-4 py-2 rounded-lg w-fit transition"
                          style={{ background: '#450a0a' }}>
                          <CloudArrowUpIcon className="h-4 w-4" />
                          {clientProject?.planPdf ? 'Replace Plan PDF' : 'Upload Plan PDF'}
                          <input type="file" accept="application/pdf" className="hidden"
                            onChange={e => e.target.files[0] && uploadClientFile(selectedClient._id, 'plan', 'pdf', e.target.files[0])} />
                        </label>
                      </div>

                      {/* Stage 2: Agreement PDF */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          ✍️ Stage 2 — Agreement
                          {clientProject?.agreementPdf && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Done</span>}
                        </h3>
                        {clientProject?.agreementPdf && (
                          <div className="mb-3 flex items-center gap-2">
                            <a href={fileUrl(clientProject.agreementPdf)} download className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                              <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Current PDF
                            </a>
                            <span className="text-xs text-gray-400">
                              · {clientProject.agreementUploadedAt ? new Date(clientProject.agreementUploadedAt).toLocaleDateString('en-IN') : ''}
                            </span>
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-white px-4 py-2 rounded-lg w-fit transition"
                          style={{ background: '#1d4ed8' }}>
                          <CloudArrowUpIcon className="h-4 w-4" />
                          {clientProject?.agreementPdf ? 'Replace Agreement PDF' : 'Upload Agreement PDF'}
                          <input type="file" accept="application/pdf" className="hidden"
                            onChange={e => e.target.files[0] && uploadClientFile(selectedClient._id, 'agreement', 'pdf', e.target.files[0])} />
                        </label>
                      </div>

                      {/* Stage 3: In-Progress Images */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-3">🏗️ Stage 3 — In-Progress Gallery</h3>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {clientProject?.progressImages?.length > 0 ? (
                            clientProject.progressImages.map((img, i) => (
                              <div key={img._id || i} className="relative group">
                                <img src={fileUrl(img.filename)} alt=""
                                  className="w-20 h-16 object-cover rounded-lg border border-gray-200" />
                                <button
                                  onClick={() => deleteProgressImage(selectedClient._id, img._id)}
                                  aria-label="Remove progress image"
                                  className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow">
                                  ×
                                </button>
                                <p className="text-xs text-gray-400 text-center mt-0.5">{new Date(img.uploadedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">No in-progress images yet.</p>
                          )}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-white px-4 py-2 rounded-lg w-fit transition"
                          style={{ background: '#7c3aed' }}>
                          <CloudArrowUpIcon className="h-4 w-4" /> Upload Site Photos (multiple)
                          <input type="file" accept="image/*" multiple className="hidden"
                            onChange={e => e.target.files.length > 0 && uploadClientFile(selectedClient._id, 'progress', 'images', e.target.files, true)} />
                        </label>
                      </div>

                      {/* Stage 4: Completion Image */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          🏠 Stage 4 — Completion
                          {clientProject?.completionImage && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Done</span>}
                        </h3>
                        {clientProject?.completionImage && (
                          <div className="mb-3 flex items-center gap-3">
                            <img src={fileUrl(clientProject.completionImage)} alt="Completion"
                              className="w-24 h-16 object-cover rounded-lg border border-gray-200" />
                            <div>
                              <a href={fileUrl(clientProject.completionImage)} download
                                className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                                <ArrowDownTrayIcon className="h-3.5 w-3.5" /> Download
                              </a>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {clientProject.completionUploadedAt ? new Date(clientProject.completionUploadedAt).toLocaleDateString('en-IN') : ''}
                              </p>
                            </div>
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-white px-4 py-2 rounded-lg w-fit transition"
                          style={{ background: '#16a34a' }}>
                          <CloudArrowUpIcon className="h-4 w-4" />
                          {clientProject?.completionImage ? 'Replace Completion Image' : 'Upload Completion Image'}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files[0] && uploadClientFile(selectedClient._id, 'completion', 'image', e.target.files[0])} />
                        </label>
                      </div>

                    </div>
                  )}

                  {/* Client Queries for this client */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800">Client Queries & Requests</h3>
                    </div>
                    {clientQueries.filter(q => q.client === selectedClient._id).length === 0 ? (
                      <p className="text-center py-10 text-gray-400 text-sm">No queries from this client yet.</p>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {clientQueries.filter(q => q.client === selectedClient._id).map(q => (
                          <div key={q._id} className="px-6 py-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                                q.requestType === 'query' ? 'bg-blue-100 text-blue-700' :
                                q.requestType === 'approval' ? 'bg-amber-100 text-amber-700' :
                                'bg-purple-100 text-purple-700'}`}>
                                {q.requestType === 'change_request' ? 'Change Request' : q.requestType}
                              </span>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                q.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                q.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'}`}>
                                {q.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{q.message}</p>
                            {q.attachment && (
                              <a href={fileUrl(q.attachment)} download className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-2">
                                <PaperClipIcon className="h-3.5 w-3.5" /> {q.attachment}
                              </a>
                            )}
                            {q.adminReply && (
                              <div className="bg-gray-50 rounded-lg px-3 py-2 border-l-2 border-primary-400 mb-3">
                                <p className="text-xs font-bold text-gray-600 mb-0.5">Your reply:</p>
                                <p className="text-sm text-gray-700">{q.adminReply}</p>
                              </div>
                            )}
                            {/* Reply + status controls */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="Type a reply…"
                                className="flex-1 min-w-[180px] px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-red-800"
                                value={clientReplyText[q._id] || ''}
                                onChange={e => setClientReplyText(prev => ({ ...prev, [q._id]: e.target.value }))}
                              />
                              <select
                                value={q.status}
                                onChange={e => updateClientQueryReply(q._id, e.target.value, clientReplyText[q._id] || q.adminReply)}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-800 bg-white">
                                {['new','in_progress','resolved'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                              </select>
                              <button
                                onClick={() => updateClientQueryReply(q._id, q.status, clientReplyText[q._id] || '')}
                                className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition"
                                style={{ background: '#450a0a' }}>
                                Send
                              </button>
                              <button onClick={() => deleteItem('clients/queries', q._id)} className="text-red-500 hover:text-red-700">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">{new Date(q.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── EMAIL LOGS ─── */}
          {activeTab === 'email-logs' && !loadingData && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total',   value: emailLogs.length,                             color: 'bg-gray-100'   },
                  { label: 'Sent',    value: emailLogs.filter(l=>l.status==='sent').length,   color: 'bg-green-100'  },
                  { label: 'Failed',  value: emailLogs.filter(l=>l.status==='failed').length, color: 'bg-red-100'    },
                  { label: 'Students',value: emailLogs.filter(l=>l.role==='student').length,  color: 'bg-blue-100'   },
                ].map((s,i) => (
                  <div key={i} className={`${s.color} rounded-xl p-4 text-center`}>
                    <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="font-bold text-gray-800">Email Logs ({emailLogsTotal} total, showing {emailLogs.length})</h2>
                    <p className="text-xs text-gray-400 mt-0.5">All emails sent from the system — success and failure records</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Clear all email logs? This cannot be undone.')) return;
                      await fetch(`${API_BASE_URL}/email-logs`, { method: 'DELETE', headers: jsonHdr() });
                      fetchAll();
                    }}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition">
                    Clear All Logs
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>{['Recipient','Event','Subject','Role','Status','Date'].map(h => <th key={h} className={thCls}>{h}</th>)}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {emailLogs.map(log => (
                        <tr key={log._id} className={rowCls}>
                          <td className={tdCls}>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[160px]">{log.recipientName || '—'}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{log.recipient}</p>
                          </td>
                          <td className={`${tdCls} text-xs text-gray-500 max-w-[160px] truncate`}>
                            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{log.eventType}</code>
                          </td>
                          <td className={`${tdCls} text-xs text-gray-600 max-w-[200px] truncate`}>{log.subject}</td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                              log.role==='student' ? 'bg-blue-100 text-blue-700' :
                              log.role==='client'  ? 'bg-amber-100 text-amber-700' :
                              log.role==='admin'   ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'}`}>
                              {log.role}
                            </span>
                          </td>
                          <td className={tdCls}>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${log.status==='sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {log.status}
                            </span>
                            {log.error && (
                              <p className="text-xs text-red-400 mt-1 truncate max-w-[120px]" title={log.error}>{log.error}</p>
                            )}
                          </td>
                          <td className={`${tdCls} text-xs text-gray-400 whitespace-nowrap`}>
                            {new Date(log.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                            <br/>
                            <span className="text-gray-300">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {emailLogs.length === 0 && (
                    <div className="text-center py-12">
                      <EnvelopeIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No email logs yet. Logs will appear here when emails are sent.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {modalData && <DetailModal title={modalTitle} data={modalData} onClose={() => setModalData(null)} />}
    </div>
  );
};

export default AdminPortal;
