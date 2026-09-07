import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon, 
  DocumentArrowUpIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../utils/api';

const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    file: null,
    description: ''
  });
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');
  const authHdr = (includeContentType = false) => {
    const t = getToken();
    const h = includeContentType ? { 'Content-Type': 'application/json' } : {};
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
  };
  const jsonHdr   = () => authHdr(true);
  const bearerHdr = () => authHdr(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'employee') {
      navigate('/login');
      return;
    }
    
    setUser(parsedUser);
    fetchEmployeeData();
  }, [navigate]);

  const fetchEmployeeData = async () => {
    try {
      const filesResponse = await fetch(`${API_BASE_URL}/training/files`, {
        headers: bearerHdr()
      });
      
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setUploadedFiles(filesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      setUploadMsg({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    const maxSize = 250 * 1024 * 1024;
    if (uploadForm.file.size > maxSize) {
      setUploadMsg({ type: 'error', text: 'File too large. Maximum size is 250MB.' });
      return;
    }

    setUploading(true);
    setUploadMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('description', uploadForm.description || '');

    try {
      const response = await fetch(`${API_BASE_URL}/training/upload`, {
        method: 'POST',
        headers: bearerHdr(),
        body: formData
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setUploadedFiles(result.data || []);
        setUploadForm({ file: null, description: '' });
        setUploadMsg({ type: 'success', text: 'File uploaded successfully!' });
        const fi = document.getElementById('emp-file-input');
        if (fi) fi.value = '';
        setTimeout(() => setUploadMsg({ type: '', text: '' }), 4000);
      } else {
        setUploadMsg({ type: 'error', text: result.error || 'Upload failed. Please try again.' });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMsg({ type: 'error', text: 'Network error — could not reach server. Check your connection.' });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 py-4 sm:px-0">
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-medium transition duration-300 ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChartBarIcon className="h-5 w-5 inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 text-sm font-medium transition duration-300 ${
                  activeTab === 'files'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <DocumentArrowUpIcon className="h-5 w-5 inline mr-2" />
                File Uploads
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 text-sm font-medium transition duration-300 ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserIcon className="h-5 w-5 inline mr-2" />
                Profile
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-6 sm:px-0">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <DocumentArrowUpIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
                      <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <ClockIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Sector</p>
                      <p className="text-lg font-bold text-gray-900">{user.sector || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="space-y-6">
                {/* Upload Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Upload New File</h2>

                  {uploadMsg.text && (
                    <div className={`mb-4 px-4 py-3 rounded-md text-sm ${
                      uploadMsg.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      {uploadMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        File <span className="text-xs text-gray-400">(images, PDFs, Word docs, videos — max 250MB)</span>
                      </label>
                      <input
                        id="emp-file-input"
                        type="file"
                        accept="image/*,application/pdf,.doc,.docx,video/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null;
                          setUploadForm({ ...uploadForm, file: f });
                          if (f) setUploadMsg({ type: '', text: '' });
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {uploadForm.file && (
                        <p className="mt-2 text-xs text-gray-500">
                          Selected: <span className="font-medium text-gray-700">{uploadForm.file.name}</span>
                          {' · '}
                          {(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows="3"
                        placeholder="Describe what this file contains..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <DocumentArrowUpIcon className="h-5 w-5" />
                          Upload File
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Uploaded Files List */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Uploaded Files ({uploadedFiles.length})</h2>
                  {uploadedFiles.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No files uploaded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={file._id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md gap-4">
                          <div className="flex items-center min-w-0 flex-1">
                            <DocumentArrowUpIcon className="h-8 w-8 text-gray-400 mr-4 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{file.originalName || file.filename || 'Unnamed file'}</p>
                              <p className="text-sm text-gray-500 truncate">{file.description || '—'}</p>
                              <p className="text-xs text-gray-400">
                                Uploaded: {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : '—'}
                              </p>
                            </div>
                          </div>
                          <a
                            href={file.filePath || file.filename || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition duration-300 flex-shrink-0"
                          >
                            Open
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Employee Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {user.name}</p>
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      <p><span className="font-medium">Mobile:</span> {user.mobileNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Location Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">City:</span> {user.city || 'Not provided'}</p>
                      <p><span className="font-medium">District:</span> {user.district || 'Not provided'}</p>
                      <p><span className="font-medium">State:</span> {user.state || 'Not provided'}</p>
                      <p><span className="font-medium">Sector:</span> {user.sector || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;