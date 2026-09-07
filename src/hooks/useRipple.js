import { useEffect } from 'react';

const useRipple = () => {
  useEffect(() => {
    const handleClick = (e) => {
      // skip if clicking inside an input / textarea / select
      const tag = e.target.tagName.toLowerCase();
      if (['input', 'textarea', 'select', 'option'].includes(tag)) return;

      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';

      const size = 60;
      ripple.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - size / 2}px;
        top: ${e.clientY - size / 2}px;
      `;

      document.body.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
};

export default useRipple;
