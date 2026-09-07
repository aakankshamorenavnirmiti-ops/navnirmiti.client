import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon, HomeModernIcon, BuildingLibraryIcon,
  EyeIcon, MapPinIcon,
} from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import ProjectModal from '../components/ProjectModal';
import ProjectSlider from '../components/ProjectSlider';
import './PageHero.css';
import { imageUrl } from '../utils/fileUrl';
import { API_BASE_URL } from '../utils/api';

const CATEGORIES = [
  { id: 'all',           name: 'All Projects',  icon: <BuildingOfficeIcon  className="h-5 w-5" /> },
  { id: 'residential',   name: 'Residential',   icon: <HomeModernIcon      className="h-5 w-5" /> },
  { id: 'commercial',    name: 'Commercial',     icon: <BuildingLibraryIcon className="h-5 w-5" /> },
  { id: 'interior',      name: 'Interiors',      icon: <HomeModernIcon      className="h-5 w-5" /> },
  { id: 'hotel',         name: 'Hotels',         icon: <BuildingLibraryIcon className="h-5 w-5" /> },
  { id: 'infrastructure',name: 'Infrastructure', icon: <BuildingOfficeIcon  className="h-5 w-5" /> },
];

const Projects = () => {
  const [activeFilter,    setActiveFilter]    = useState('all');
  const [projects,        setProjects]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen,     setIsModalOpen]     = useState(false);

  /* Load projects whenever filter changes */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = activeFilter === 'all'
          ? `${API_BASE_URL}/projects`
          : `${API_BASE_URL}/projects/category/${activeFilter}`;
        const res  = await fetch(url);
        const data = await res.json();
        setProjects(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        console.error('Error loading projects:', e);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeFilter]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  /* Helper: get displayable image for a card thumbnail */
  const getThumb = (p) => {
    if (p.images && p.images.length > 0) return imageUrl(p.images[0]);
    if (p.image)                          return imageUrl(p.image);
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-6 text-center page-hero-content">
          <h1 className="page-hero-title">Our Projects</h1>
          <p className="page-hero-sub">
            Explore our portfolio of successfully completed projects across various domains.
          </p>
        </div>
      </section>

      {/* ── Featured Slider (all projects, unfiltered) ── */}
      {!loading && projects.length > 0 && (
        <section className="py-12 bg-gray-950">
          <div className="container mx-auto px-6" style={{ maxWidth: '1300px' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-2xl">Featured Projects</h2>
              <span className="text-gray-400 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            </div>
            <ProjectSlider projects={projects} onProjectClick={handleProjectClick} />
          </div>
        </section>
      )}

      {/* ── Category filter ── */}
      <section className="py-10 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition duration-200 shadow-sm ${
                  activeFilter === cat.id
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                style={activeFilter === cat.id ? { background: '#450a0a' } : {}}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {cat.icon}
                {cat.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects Grid ── */}
      <section className="py-16 flex-grow">
        <div className="container mx-auto px-6" style={{ maxWidth: '1300px' }}>

          {loading && (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
              <p className="mt-4 text-gray-500">Loading projects…</p>
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="text-center py-24">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No projects found</h3>
              <p className="text-gray-500">Try a different category filter.</p>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence mode="popLayout">
                {projects.map((project, index) => {
                  const thumb  = getThumb(project);
                  const images = project.images?.length > 0 ? project.images : project.image ? [project.image] : [];
                  const catObj = CATEGORIES.find(c => c.id === project.category);

                  return (
                    <motion.article
                      key={project._id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover:shadow-2xl transition-all duration-300"
                      whileHover={{ y: -8 }}
                      onClick={() => handleProjectClick(project)}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden h-60 bg-gradient-to-br from-gray-200 to-gray-300">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                            style={{ transition: 'transform 0.5s ease' }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                            <BuildingOfficeIcon className="h-16 w-16 text-primary-300" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                            <EyeIcon className="h-6 w-6 text-primary-700" />
                          </div>
                        </div>

                        {/* Category badge */}
                        <div
                          className="absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-full"
                          style={{ background: '#450a0a' }}
                        >
                          {catObj?.name || project.category}
                        </div>

                        {/* Multi-image count */}
                        {images.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                            📷 {images.length}
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-200 leading-snug">
                            {project.title}
                          </h3>
                          <span className="bg-primary-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0">
                            {project.year}
                          </span>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                          {project.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-gray-400 text-sm flex items-center gap-1.5">
                            <MapPinIcon className="h-4 w-4" />
                            {project.location}
                          </span>
                          <span className="text-primary-600 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-200">
                            View →
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #1a0505 0%, #450a0a 60%, #6b1414 100%)' }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-white font-bold mb-5" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Start Your Project Today
          </h2>
          <p className="text-gray-300 mb-10 max-w-2xl mx-auto text-lg">
            Ready to bring your construction vision to life? Contact us for a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/contact"
              className="bg-white font-bold py-4 px-10 rounded-full transition duration-300 shadow-xl text-center hover:bg-gray-100"
              style={{ color: '#450a0a' }}
            >
              Request a Quote
            </Link>
            <Link
              to="/services"
              className="border-2 border-white/60 hover:border-white text-white font-bold py-4 px-10 rounded-full transition duration-300 text-center hover:bg-white/10"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* Project detail modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Projects;
