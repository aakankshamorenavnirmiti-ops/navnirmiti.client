import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { BuildingOfficeIcon, WrenchIcon, HomeModernIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Building block shapes ── */
const blocks = [
  { w: 56, h: 28, top: '12%', left: '6%',  delay: 0,    dur: 5.5, rotate: -8  },
  { w: 36, h: 36, top: '22%', left: '82%', delay: 0.4,  dur: 6.2, rotate: 12  },
  { w: 72, h: 24, top: '38%', left: '3%',  delay: 0.8,  dur: 7,   rotate: 4   },
  { w: 28, h: 28, top: '55%', left: '88%', delay: 0.2,  dur: 5,   rotate: -15 },
  { w: 48, h: 20, top: '68%', left: '10%', delay: 1.0,  dur: 6.8, rotate: 6   },
  { w: 32, h: 32, top: '75%', left: '75%', delay: 0.6,  dur: 5.8, rotate: -5  },
  { w: 20, h: 20, top: '18%', left: '50%', delay: 1.2,  dur: 4.5, rotate: 20  },
  { w: 44, h: 16, top: '48%', left: '60%', delay: 0.3,  dur: 7.2, rotate: -10 },
];

/* small dot particles */
const dots = [
  { top: '15%', left: '25%', delay: 0   },
  { top: '30%', left: '70%', delay: 0.5 },
  { top: '60%', left: '40%', delay: 1   },
  { top: '80%', left: '20%', delay: 0.8 },
  { top: '45%', left: '90%', delay: 0.3 },
  { top: '72%', left: '55%', delay: 1.4 },
];

const StatItem = ({ number, label, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      className="hero-stat-item"
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      variants={fadeUp}
    >
      <span className="hero-stat-number">{number}</span>
      <span className="hero-stat-label">{label}</span>
    </motion.div>
  );
};

const Home = () => {
  const services = [
    {
      icon: <BuildingOfficeIcon className="h-10 w-10" />,
      title: 'Construction',
      description: 'Complete civil and structural works for residential and commercial projects.',
    },
    {
      icon: <WrenchIcon className="h-10 w-10" />,
      title: 'Consulting',
      description: 'Professional guidance and project management from planning to execution.',
    },
    {
      icon: <HomeModernIcon className="h-10 w-10" />,
      title: 'Interior Designing',
      description: 'Creative and functional interior solutions for residential and commercial spaces.',
    },
  ];

  const stats = [
    { number: '25+', label: 'Years Experience' },
    { number: '250+', label: 'Residential Projects' },
    { number: '25+', label: 'Commercial Projects' },
    { number: '100%', label: 'Client Satisfaction' },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero ── */}
      <section className="hero-section">
        {/* dark overlay */}
        <div className="hero-overlay" />

        {/* ── Building block animations ── */}
        <div className="hero-blocks" aria-hidden="true">
          {blocks.map((b, i) => (
            <motion.div
              key={i}
              className="hero-block"
              style={{ width: b.w, height: b.h, top: b.top, left: b.left }}
              initial={{ opacity: 0, scale: 0.3, rotate: b.rotate }}
              animate={{
                opacity: [0, 0.55, 0.45, 0.55],
                scale: 1,
                rotate: [b.rotate, b.rotate + 3, b.rotate - 3, b.rotate],
                y: [0, -12, 0, -8, 0],
              }}
              transition={{
                opacity:  { duration: 1.2, delay: b.delay },
                scale:    { duration: 1.0, delay: b.delay, ease: [0.22, 1, 0.36, 1] },
                rotate:   { duration: b.dur, delay: b.delay + 1, repeat: Infinity, ease: 'easeInOut' },
                y:        { duration: b.dur, delay: b.delay + 1, repeat: Infinity, ease: 'easeInOut' },
              }}
            />
          ))}

          {/* girder lines */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`g${i}`}
              className="hero-girder"
              style={{ top: `${25 + i * 22}%`, left: `${15 + i * 28}%`, width: `${60 + i * 20}px` }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.35 }}
              transition={{ duration: 1.4, delay: 0.5 + i * 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}

          {/* dot particles */}
          {dots.map((d, i) => (
            <motion.div
              key={`d${i}`}
              className="hero-dot"
              style={{ top: d.top, left: d.left }}
              animate={{
                opacity: [0.2, 0.7, 0.2],
                scale:   [1, 1.4, 1],
                y:       [0, -10, 0],
              }}
              transition={{
                duration: 3 + i * 0.4,
                delay: d.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* content */}
        <div className="hero-content container mx-auto px-6" style={{textAlign:'center',alignItems:'center',display:'flex',flexDirection:'column'}}>
          <motion.p
            className="hero-eyebrow"
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
          >
            Nav Nirmiti Constructions
          </motion.p>

          <motion.h1
            className="hero-headline"
            initial="hidden"
            animate="visible"
            custom={0.15}
            variants={fadeUp}
          >
            Building What<br />Matters Most.
          </motion.h1>

          <motion.p
            className="hero-subline"
            style={{textAlign:'center',margin:'0 auto 2.5rem'}}
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fadeUp}
          >
            25+ years of trusted construction excellence — from foundations to finishing.
          </motion.p>

          <motion.div
            className="hero-cta-group"
            style={{justifyContent:'center'}}
            initial="hidden"
            animate="visible"
            custom={0.45}
            variants={fadeUp}
          >
            <Link to="/contact" className="hero-btn-primary">
              Get a Quote
            </Link>
            <Link to="/projects" className="hero-btn-secondary">
              View Our Work <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* stats bar */}
        <div className="hero-stats-bar">
          <div className="container mx-auto px-6">
            <div className="hero-stats-grid">
              {stats.map((s, i) => (
                <StatItem key={i} number={s.number} label={s.label} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="services-section">
        <div className="container mx-auto px-6">
          <motion.div
            className="section-header"
            style={{textAlign:'center'}}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <p className="section-eyebrow">What We Do</p>
            <h2 className="section-title">Our Services</h2>
            <p className="section-sub" style={{margin:'0 auto'}}>
              Comprehensive construction solutions tailored to meet your specific needs.
            </p>
          </motion.div>

          <div className="services-grid">
            {services.map((service, i) => (
              <motion.div
                key={i}
                className="service-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.12}
                variants={fadeUp}
              >
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-desc">{service.description}</p>
                <Link to="/services" className="service-link">
                  Learn more <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="about-section">
        <div className="container mx-auto px-6">
          <div className="about-grid">
            <motion.div
              className="about-image-wrap"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <div className="about-image-placeholder" />
              <div className="about-image-accent" />
            </motion.div>

            <motion.div
              className="about-text"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0.15}
              variants={fadeUp}
            >
              <p className="section-eyebrow">Who We Are</p>
              <h2 className="section-title">About Nav Nirmiti Constructions</h2>
              <p className="about-body">
                Under the leadership of Er. Ramchandra More, Nav Nirmiti Constructions has been a reputed name in the industry for more than 25 years — with 250+ residential and 25+ commercial projects completed across the region.
              </p>
              <p className="about-body">
                Every project is conceptualized and executed according to Vastu Shastra principles, blending traditional wisdom with modern practices to create functional, aesthetic, and lasting structures.
              </p>
              <Link to="/about" className="hero-btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
                Our Story <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="cta-overlay" />
        <motion.div
          className="container mx-auto px-6 cta-content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          variants={fadeUp}
        >
          <h2 className="cta-title">Ready to Start Your Project?</h2>
          <p className="cta-sub">Contact us today for a free consultation and quote.</p>
          <div className="hero-cta-group">
            <Link to="/contact" className="hero-btn-primary">Contact Us</Link>
            <Link to="/projects" className="hero-btn-secondary">
              View Our Work <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
