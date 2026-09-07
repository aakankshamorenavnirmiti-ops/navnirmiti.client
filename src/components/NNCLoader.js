import React, { useEffect, useState } from 'react';

const NNCLoader = ({ visible }) => {
  const [shouldRender, setShouldRender] = useState(visible);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setFading(false);
    } else {
      // Start fade-out then unmount
      setFading(true);
      const t = setTimeout(() => setShouldRender(false), 1000);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        .nnc-loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #1a0505;
          transition: opacity 1s ease;
        }
        .nnc-loader-overlay.fade-out {
          opacity: 0;
          pointer-events: none;
        }

        /* House SVG draw-on */
        .nnc-house {
          width: 52px;
          height: 48px;
          margin-bottom: 18px;
          opacity: 0;
          animation: nnc-house-appear 1.2s ease forwards 0.4s;
        }
        .nnc-house-path {
          stroke: #c2baba;
          stroke-width: 2.2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: nnc-draw 1.8s ease forwards 0.5s;
        }
        @keyframes nnc-house-appear {
          to { opacity: 1; }
        }
        @keyframes nnc-draw {
          to { stroke-dashoffset: 0; }
        }

        /* NNC letters */
        .nnc-wordmark {
          display: flex;
          align-items: baseline;
          gap: 0;
          margin-bottom: 24px;
        }
        .nnc-letter {
          font-family: 'Lora', 'Noto Serif', Georgia, serif;
          font-weight: 700;
          font-size: clamp(2.8rem, 8vw, 4.2rem);
          color: #fdf8f8;
          letter-spacing: 0.18em;
          opacity: 0;
          transform: translateY(16px);
          animation: nnc-letter-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .nnc-letter:nth-child(1) { animation-delay: 1.1s; }
        .nnc-letter:nth-child(2) { animation-delay: 1.45s; }
        .nnc-letter:nth-child(3) { animation-delay: 1.8s; }
        @keyframes nnc-letter-rise {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Tagline */
        .nnc-tagline {
          font-family: 'Playwrite DE Grund', cursive, sans-serif;
          font-size: clamp(0.65rem, 2vw, 0.82rem);
          color: #c2baba;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          opacity: 0;
          animation: nnc-fade-in 0.6s ease forwards 2.2s;
          margin-bottom: 32px;
        }
        @keyframes nnc-fade-in {
          to { opacity: 0.75; }
        }

        /* Progress bar */
        .nnc-bar-track {
          width: clamp(100px, 28vw, 160px);
          height: 2px;
          background: rgba(194, 186, 186, 0.15);
          border-radius: 2px;
          overflow: hidden;
          opacity: 0;
          animation: nnc-fade-in 0.4s ease forwards 2.1s;
        }
        .nnc-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #450a0a, #c0392b, #450a0a);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: nnc-bar-slide 2.2s ease forwards 2.15s, nnc-bar-shimmer 2s linear infinite 2.15s;
          width: 0%;
        }
        @keyframes nnc-bar-slide {
          0%   { width: 0%; }
          60%  { width: 75%; }
          100% { width: 100%; }
        }
        @keyframes nnc-bar-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className={`nnc-loader-overlay${fading ? ' fade-out' : ''}`}>
        {/* House icon — SVG drawn on */}
        <svg className="nnc-house" viewBox="0 0 52 48" xmlns="http://www.w3.org/2000/svg">
          <path className="nnc-house-path"
            d="M4 22 L26 4 L48 22 M8 19 L8 44 L44 44 L44 19 M18 44 L18 30 L34 30 L34 44 M20 19 L20 27 L32 27 L32 19"
          />
        </svg>

        {/* NNC wordmark */}
        <div className="nnc-wordmark" aria-label="NNC">
          <span className="nnc-letter">N</span>
          <span className="nnc-letter">N</span>
          <span className="nnc-letter">C</span>
        </div>

        {/* Tagline */}
        <p className="nnc-tagline">Nav Nirmiti Constructions</p>

        {/* Progress bar */}
        <div className="nnc-bar-track">
          <div className="nnc-bar-fill" />
        </div>
      </div>
    </>
  );
};

export default NNCLoader;
