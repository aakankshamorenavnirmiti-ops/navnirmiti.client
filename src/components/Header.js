import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '../image/logo.png';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="header">
      {/* Main nav */}
      <div className="header-main">
        <div className="container mx-auto header-inner">
          {/* Logo */}
          <Link to="/" className="header-brand">
            <img src={logo} alt="Nav Nirmiti Constructions Logo" className="header-logo" />
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav hidden md:flex">
            <Link to="/" className="header-nav-link">Home</Link>
            <Link to="/about" className="header-nav-link">About</Link>
            <Link to="/services" className="header-nav-link">Services</Link>
            <Link to="/projects" className="header-nav-link">Projects</Link>
            <Link to="/careers" className="header-nav-link">Careers</Link>
            <Link to="/testimonials" className="header-nav-link">Testimonials</Link>
            <Link to="/blog" className="header-nav-link">Blog</Link>
            <Link to="/contact" className="header-nav-link">Contact</Link>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <Link to="/client-login" className="header-login hidden md:inline-flex" style={{ marginRight: '0.5rem', borderColor: '#1d4ed8', color: '#1d4ed8' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#1d4ed8'; }}>
              Client Login
            </Link>
            <Link to="/login" className="header-login hidden md:inline-flex">
              Student Login
            </Link>
            <button onClick={toggleMenu} className="header-menu-btn md:hidden" aria-label="Toggle menu">
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="header-mobile-nav">
          <Link to="/" className="header-mobile-link" onClick={toggleMenu}>Home</Link>
          <Link to="/about" className="header-mobile-link" onClick={toggleMenu}>About</Link>
          <Link to="/services" className="header-mobile-link" onClick={toggleMenu}>Services</Link>
          <Link to="/projects" className="header-mobile-link" onClick={toggleMenu}>Projects</Link>
          <Link to="/careers" className="header-mobile-link" onClick={toggleMenu}>Careers</Link>
          <Link to="/testimonials" className="header-mobile-link" onClick={toggleMenu}>Testimonials</Link>
          <Link to="/blog" className="header-mobile-link" onClick={toggleMenu}>Blog</Link>
          <Link to="/contact" className="header-mobile-link" onClick={toggleMenu}>Contact</Link>
          <Link to="/login" className="header-mobile-link" onClick={toggleMenu}>Student Login</Link>
          <Link to="/client-login" className="header-mobile-link" onClick={toggleMenu}>Client Login</Link>
        </div>
      )}
    </header>
  );
};

export default Header;
