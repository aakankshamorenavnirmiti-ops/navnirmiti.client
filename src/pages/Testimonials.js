import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftEllipsisIcon, StarIcon } from '@heroicons/react/24/solid';
import Footer from '../components/Footer';
import './PageHero.css';
import { API_BASE_URL } from '../utils/api';
import { imageUrl } from '../utils/fileUrl';

const CATEGORIES = [
  { id: 'all',      label: 'All' },
  { id: 'client',   label: 'Clients' },
  { id: 'employee', label: 'Employees' },
  { id: 'student',  label: 'Students' },
];

const categoryColors = {
  client:   { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: '#d97706' },
  employee: { bg: 'bg-green-100',  text: 'text-green-800',  dot: '#16a34a' },
  student:  { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: '#2563eb' },
};

/* Single testimonial card */
const TestimonialCard = ({ item, index }) => {
  const col   = categoryColors[item.category] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: '#6b7280' };
  const initials = item.name
    ? item.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.96 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-7 flex flex-col"
    >
      {/* Quote icon */}
      <div className="mb-4">
        <ChatBubbleLeftEllipsisIcon className="h-8 w-8 opacity-15" style={{ color: col.dot }} />
      </div>

      {/* Testimonial text */}
      <p className="text-gray-700 leading-relaxed flex-1 mb-6 italic" style={{ fontSize: '1rem' }}>
        "{item.text}"
      </p>

      {/* Video if present */}
      {item.video && (
        <div className="mb-5 rounded-xl overflow-hidden">
          {item.video.startsWith('http') ? (
            <video
              src={item.video}
              controls
              className="w-full rounded-xl max-h-64 object-cover"
              preload="metadata"
            />
          ) : (
            <video
              src={`${process.env.REACT_APP_API_URL || ''}/uploads/${item.video}`}
              controls
              className="w-full rounded-xl max-h-64 object-cover"
              preload="metadata"
            />
          )}
        </div>
      )}

      {/* Stars (decorative — 5 stars) */}
      <div className="flex gap-0.5 mb-5">
        {[...Array(5)].map((_, i) => (
          <StarIcon key={i} className="h-4 w-4" style={{ color: col.dot }} />
        ))}
      </div>

      {/* Author row */}
      <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
        {/* Photo or avatar */}
        {item.photo ? (
          <img
            src={imageUrl(item.photo)}
            alt={item.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow font-bold text-white text-lg"
            style={{ background: `linear-gradient(135deg, ${col.dot}, #1a0505)` }}
          >
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 truncate">{item.name}</p>
          {item.designation && (
            <p className="text-sm text-gray-500 truncate">{item.designation}</p>
          )}
        </div>

        {/* Category badge */}
        <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize flex-shrink-0 ${col.bg} ${col.text}`}>
          {item.category}
        </span>
      </div>
    </motion.div>
  );
};

/* ═══ PAGE ═══ */
const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE_URL}/testimonials`);
        const data = await res.json();
        setTestimonials(data.data || []);
      } catch (e) {
        console.error('Error loading testimonials:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeTab === 'all'
    ? testimonials
    : testimonials.filter(t => t.category === activeTab);

  /* Counts per category */
  const counts = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = cat.id === 'all'
      ? testimonials.length
      : testimonials.filter(t => t.category === cat.id).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col">

      {/* Hero */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-6 text-center page-hero-content">
          <h1 className="page-hero-title">Testimonials</h1>
          <p className="page-hero-sub">
            Hear from our clients, employees, and students about their experience with Nav Nirmiti Constructions.
          </p>
        </div>
      </section>

      {/* Category filter tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-[0] z-30 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeTab === cat.id
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={activeTab === cat.id ? { background: '#450a0a' } : {}}
              >
                {cat.label}
                {counts[cat.id] > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === cat.id ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    {counts[cat.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-6" style={{ maxWidth: '1200px' }}>

          {loading && (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary-600" />
              <p className="mt-5 text-gray-500">Loading testimonials…</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-5xl mb-5">💬</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {activeTab === 'all' ? 'No testimonials yet' : `No ${activeTab} testimonials yet`}
              </h3>
              <p className="text-gray-500">Check back soon.</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <TestimonialCard key={item._id} item={item} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Join hundreds of satisfied clients who have trusted Nav Nirmiti Constructions with their dream projects.
          </p>
          <a
            href="/contact"
            className="inline-block text-white font-bold py-4 px-10 rounded-full transition shadow-lg"
            style={{ background: '#450a0a' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5e0e0e')}
            onMouseLeave={e => (e.currentTarget.style.background = '#450a0a')}
          >
            Get a Free Consultation
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;
