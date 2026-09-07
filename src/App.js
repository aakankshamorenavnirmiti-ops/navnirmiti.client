import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Careers from './pages/Careers';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import AdminPortal from './pages/AdminPortal';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import ClientLogin from './pages/ClientLogin';
import ClientRegistration from './pages/ClientRegistration';
import ClientDashboard from './pages/ClientDashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentRegistration from './pages/StudentRegistration';
import useRipple from './hooks/useRipple';
import NNCLoader from './components/NNCLoader';

/* ── Auth guards ── */
const getUser  = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const getToken = () => localStorage.getItem('token');

const RequireRole = ({ role, children, redirect = '/login' }) => {
  const user  = getUser();
  const token = getToken();
  if (!token || !user || user.role !== role) return <Navigate to={redirect} replace />;
  return children;
};

const pageVariants = {
  initial: { opacity: 0, y: 28, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -18, scale: 0.98, transition: { duration: 0.28, ease: [0.4, 0, 1, 1] } },
};

const ADMIN_PATHS     = ['/admin-portal', '/admin-login'];
const DASHBOARD_PATHS = ['/student-dashboard', '/client-dashboard'];

const AppLayout = () => {
  const location    = useLocation();
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Route change loader
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const isAdminPage = ADMIN_PATHS.some(p => location.pathname.startsWith(p));
  const isDashboard = DASHBOARD_PATHS.some(p => location.pathname.startsWith(p));
  const hideHeader  = isAdminPage || isDashboard;

  return (
    <div className="App">
      <NNCLoader visible={loading} />
      {!hideHeader && <Header />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          variants={hideHeader ? {} : pageVariants}
          initial={hideHeader ? false : 'initial'}
          animate={hideHeader ? false : 'animate'}
          exit={hideHeader   ? false : 'exit'}
        >
          <Routes location={location}>
            {/* Public */}
            <Route path="/"                   element={<Home />} />
            <Route path="/about"              element={<About />} />
            <Route path="/services"           element={<Services />} />
            <Route path="/projects"           element={<Projects />} />
            <Route path="/careers"            element={<Careers />} />
            <Route path="/blog"               element={<Blog />} />
            <Route path="/contact"            element={<Contact />} />
            <Route path="/testimonials"       element={<Testimonials />} />
            <Route path="/login"              element={<Login />} />
            <Route path="/client-login"       element={<ClientLogin />} />
            <Route path="/register/student"   element={<StudentRegistration />} />
            <Route path="/register/client"    element={<ClientRegistration />} />

            {/* Protected dashboards */}
            <Route path="/student-dashboard"  element={<RequireRole role="student" redirect="/login"><StudentDashboard /></RequireRole>} />
            <Route path="/client-dashboard"   element={<RequireRole role="client"  redirect="/client-login"><ClientDashboard /></RequireRole>} />

            {/* Admin */}
            <Route path="/admin-login"        element={<AdminLogin />} />
            <Route path="/admin-portal"       element={<AdminPortal />} />
            <Route path="/admin"              element={<Navigate to="/admin-portal" replace />} />

            {/* Catch-all */}
            <Route path="*"                   element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function App() {
  useRipple();
  return <Router><AppLayout /></Router>;
}

export default App;
