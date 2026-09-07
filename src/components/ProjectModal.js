import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon, MapPinIcon, CalendarIcon,
  ChevronLeftIcon, ChevronRightIcon, TagIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { imageUrl } from '../utils/fileUrl';

const ProjectModal = ({ project, isOpen, onClose }) => {
  const [imgIdx, setImgIdx] = useState(0);

  if (!project) return null;

  /* Normalise images — support both multi-image array and legacy single field */
  const images = (() => {
    if (project.images && project.images.length > 0) return project.images;
    if (project.image) return [project.image];
    return [];
  })();

  const hasImages = images.length > 0;

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIdx(i => (i - 1 + images.length) % images.length);
  };
  const nextImg = (e) => {
    e.stopPropagation();
    setImgIdx(i => (i + 1) % images.length);
  };

  const catLabel = project.category
    ? project.category.charAt(0).toUpperCase() + project.category.slice(1)
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,2,2,0.82)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl w-full overflow-hidden flex flex-col"
            style={{ maxWidth: '900px', maxHeight: '92vh' }}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1,   opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ scale: 0.92, opacity: 0, y: 20, transition: { duration: 0.25 } }}
            onClick={e => e.stopPropagation()}
          >

            {/* ── Image gallery ── */}
            {hasImages ? (
              <div className="relative bg-gray-900 overflow-hidden flex-shrink-0" style={{ height: '400px' }}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imgIdx}
                    src={imageUrl(images[imgIdx])}
                    alt={`${project.title} — photo ${imgIdx + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
                    exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                  />
                </AnimatePresence>

                {/* Close btn */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 z-10 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>

                {/* Prev / Next */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-3 z-10 transition"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-3 z-10 transition"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
                    {/* Dot navigation */}
                    <div className="flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                          className={`rounded-full transition-all duration-200 ${
                            i === imgIdx ? 'bg-white w-6 h-2.5' : 'bg-white/40 w-2.5 h-2.5'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Image count badge */}
                {images.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {imgIdx + 1} / {images.length}
                  </div>
                )}
              </div>
            ) : (
              /* No images placeholder */
              <div
                className="relative flex items-center justify-center flex-shrink-0"
                style={{ height: '240px', background: 'linear-gradient(135deg, #fdf0f0, #e8a0a0)' }}
              >
                <span className="font-bold opacity-15 text-primary-600" style={{ fontSize: '8rem', lineHeight: 1 }}>
                  {project.title?.charAt(0).toUpperCase()}
                </span>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 px-6 pt-4 overflow-x-auto pb-1 flex-shrink-0 bg-gray-50">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200 ${
                      i === imgIdx ? 'ring-2 ring-primary-600 opacity-100' : 'opacity-55 hover:opacity-80'
                    }`}
                    style={{ width: 72, height: 52 }}
                  >
                    <img src={imageUrl(img)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* ── Content ── */}
            <div className="overflow-y-auto flex-1 px-8 py-6">

              {/* Title + meta */}
              <div className="mb-6">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900 leading-snug flex-1">
                    {project.title}
                  </h2>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full text-white flex-shrink-0"
                    style={{ background: '#450a0a' }}
                  >
                    {catLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    {project.year}
                  </span>
                  {images.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <TagIcon className="h-4 w-4 text-gray-400" />
                      {images.length} photo{images.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-800 mb-2">Project Description</h3>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>
              </div>

              {/* Key features (static) */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-800 mb-3">Key Highlights</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Premium quality materials',
                    'Vastu Shastra compliant design',
                    'Modern architectural approach',
                    'Timely project completion',
                    'Sustainable construction practices',
                    'Expert supervision throughout',
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#450a0a' }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Footer CTA ── */}
            <div
              className="px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 flex-shrink-0"
              style={{ background: '#fdf8f8' }}
            >
              <p className="text-sm text-gray-500">
                Interested in a similar project?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold text-sm rounded-full hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <Link
                  to="/contact"
                  onClick={onClose}
                  className="px-6 py-2.5 text-white font-bold text-sm rounded-full transition shadow"
                  style={{ background: '#450a0a' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#5e0e0e')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#450a0a')}
                >
                  Request Similar Project
                </Link>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
