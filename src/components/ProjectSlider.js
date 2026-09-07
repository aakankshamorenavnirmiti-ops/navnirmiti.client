import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';
import { imageUrl } from '../utils/fileUrl';

/* ─── Ken-Burns slide variant ─── */
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
  }),
};

/* ─── Inner image cycler for a single project (when it has multiple images) ─── */
const ImageCycler = ({ images, title }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgDir, setImgDir] = useState(1);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setImgDir(1);
    setImgIdx(i => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(next, 3500);
    return () => clearInterval(timerRef.current);
  }, [images.length, next]);

  const goImg = (dir) => {
    clearInterval(timerRef.current);
    setImgDir(dir);
    setImgIdx(i => (i + images.length + dir) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
        <span className="text-primary-400 text-7xl font-bold opacity-20">
          {title?.charAt(0).toUpperCase() || 'N'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence custom={imgDir} initial={false}>
        <motion.img
          key={imgIdx}
          src={imageUrl(images[imgIdx])}
          alt={`${title} — image ${imgIdx + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          custom={imgDir}
          variants={{
            enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
            center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0, transition: { duration: 0.35 } }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
        />
      </AnimatePresence>

      {/* Image nav dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); clearInterval(timerRef.current); setImgDir(i > imgIdx ? 1 : -1); setImgIdx(i); }}
              className={`rounded-full transition-all duration-300 ${i === imgIdx ? 'bg-white w-5 h-2' : 'bg-white/50 w-2 h-2'}`}
            />
          ))}
        </div>
      )}

      {/* Image prev/next arrows (only shown if >1 image) */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goImg(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition z-10"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goImg(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition z-10"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN SLIDER
═══════════════════════════════════════════ */
const ProjectSlider = ({ projects = [], onProjectClick }) => {
  const [current,   setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused,    setPaused]    = useState(false);
  const autoRef = useRef(null);

  const count = projects.length;

  const go = useCallback((dir) => {
    setDirection(dir);
    setCurrent(c => (c + count + dir) % count);
  }, [count]);

  /* Auto-play — 5 s per slide, pauses on hover */
  useEffect(() => {
    if (paused || count <= 1) return;
    autoRef.current = setInterval(() => go(1), 5000);
    return () => clearInterval(autoRef.current);
  }, [paused, go, count]);

  if (count === 0) return null;

  const project  = projects[current];
  const images   = project.images?.length > 0 ? project.images : project.image ? [project.image] : [];
  const catLabel = project.category
    ? project.category.charAt(0).toUpperCase() + project.category.slice(1)
    : '';

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-2xl select-none"
      style={{ aspectRatio: '16/7', minHeight: '360px', maxHeight: '580px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Slide ── */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0 flex"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {/* Image half */}
          <div className="w-full h-full relative">
            {/* Ken-Burns zoom on background */}
            <motion.div
              className="absolute inset-0"
              animate={{ scale: paused ? 1 : [1, 1.06, 1] }}
              transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
            >
              <ImageCycler images={images} title={project.title} />
            </motion.div>

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              {/* Category pill */}
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
                style={{ background: '#450a0a', color: '#fff' }}
              >
                {catLabel}
              </span>

              <h2
                className="text-white font-bold mb-3 leading-tight"
                style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}
              >
                {project.title}
              </h2>

              <p
                className="text-gray-200 mb-5 leading-relaxed"
                style={{
                  fontSize: 'clamp(0.85rem, 1.2vw, 1rem)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxWidth: '60ch',
                }}
              >
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-1.5 text-sm text-gray-300">
                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                  {project.location}
                </span>
                <span className="text-sm text-gray-300">
                  {project.year}
                </span>
                {images.length > 1 && (
                  <span className="text-sm text-gray-300">
                    {images.length} photos
                  </span>
                )}
              </div>

              {/* View button */}
              {onProjectClick && (
                <button
                  onClick={() => onProjectClick(project)}
                  className="mt-5 inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:gap-3"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)' }}
                >
                  <EyeIcon className="h-4 w-4" />
                  View Project
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Prev / Next arrows ── */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
            aria-label="Previous project"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-3 transition-all duration-200 hover:scale-110"
            aria-label="Next project"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* ── Slide dots ── */}
      {count > 1 && (
        <div className="absolute bottom-5 right-6 z-20 flex gap-2 items-center">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-white w-7 h-2.5'
                  : 'bg-white/40 hover:bg-white/70 w-2.5 h-2.5'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ── */}
      {count > 1 && (
        <div className="absolute top-5 right-5 z-20 bg-black/30 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
          {current + 1} / {count}
        </div>
      )}

      {/* ── Pause indicator ── */}
      {paused && count > 1 && (
        <div className="absolute top-5 left-5 z-20 bg-black/30 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
          ⏸ Paused
        </div>
      )}
    </div>
  );
};

export default ProjectSlider;
