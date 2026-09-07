import React, { useState, useEffect } from 'react';
import { CalendarIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import './PageHero.css';
import { API_BASE_URL } from '../utils/api';
import { imageUrl } from '../utils/fileUrl';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE_URL}/blog`);
        const data = await res.json();
        setBlogPosts((data.data || []).filter(p => p.published));
      } catch (e) {
        console.error('Error loading blog posts:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero ── */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-6 text-center page-hero-content">
          <h1 className="page-hero-title">News &amp; Insights</h1>
          <p className="page-hero-sub">
            Stay updated with the latest industry trends, company news, and construction insights.
          </p>
        </div>
      </section>

      {/* ── Blog Posts ── */}
      <section className="py-16 bg-gray-50 flex-grow">
        <div className="container mx-auto px-6" style={{ maxWidth: '1100px' }}>

          {/* Loading */}
          {loading && (
            <div className="text-center py-24">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary-600" />
              <p className="mt-5 text-gray-500">Loading posts…</p>
            </div>
          )}

          {/* Empty */}
          {!loading && blogPosts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-5xl mb-6">📰</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No posts yet</h3>
              <p className="text-gray-500 text-lg">Check back soon for updates from Nav Nirmiti.</p>
            </div>
          )}

          {/* Cards */}
          {!loading && blogPosts.length > 0 && (
            <div className="space-y-10">
              {blogPosts.map(post => (
                <article
                  key={post._id}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col lg:flex-row group"
                  style={{ minHeight: '280px' }}
                >
                  {/* ── Image panel ── */}
                  <div
                    className="lg:flex-shrink-0 relative overflow-hidden"
                    style={{ width: '100%', maxWidth: '420px', minHeight: '280px' }}
                  >
                    {post.image ? (
                      <img
                        src={imageUrl(post.image)}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ minHeight: '280px', height: '100%' }}
                      />
                    ) : (
                      /* Placeholder with category initial */
                      <div
                        className="w-full h-full flex flex-col items-center justify-center group-hover:opacity-90 transition-opacity duration-300"
                        style={{
                          minHeight: '280px',
                          background: 'linear-gradient(135deg, #fdf0f0 0%, #f5c6c6 40%, #e8a0a0 100%)',
                        }}
                      >
                        <span
                          className="font-bold text-primary-600 select-none"
                          style={{ fontSize: '7rem', opacity: 0.18, lineHeight: 1 }}
                        >
                          {post.category?.charAt(0).toUpperCase() || 'N'}
                        </span>
                        <span className="text-primary-500 text-sm font-semibold uppercase tracking-widest mt-2 opacity-60">
                          {post.category}
                        </span>
                      </div>
                    )}

                    {/* Category badge overlaid on image */}
                    <span
                      className="absolute top-5 left-5 text-sm font-bold px-4 py-1.5 rounded-full shadow"
                      style={{ background: '#450a0a', color: '#fff', letterSpacing: '0.04em' }}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* ── Text panel ── */}
                  <div className="flex flex-col justify-between flex-1 px-10 py-9">

                    {/* Top: read-time */}
                    <div className="flex items-center gap-2 mb-5">
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400 font-medium">
                        {post.readTime || '5 min read'}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      className="font-bold text-gray-900 mb-4 leading-tight group-hover:text-primary-700 transition-colors duration-200"
                      style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)', lineHeight: '1.25' }}
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p
                      className="text-gray-600 leading-relaxed mb-8"
                      style={{
                        fontSize: 'clamp(0.95rem, 1.1vw, 1.05rem)',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </p>

                    {/* Footer: author + date + CTA */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-6 text-gray-500" style={{ fontSize: '0.92rem' }}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ background: '#450a0a' }}
                          >
                            {post.author?.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium text-gray-700">{post.author}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          {new Date(post.date || post.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Read more arrow */}
                      <span
                        className="flex items-center gap-2 font-semibold text-sm group-hover:gap-3 transition-all duration-200"
                        style={{ color: '#450a0a' }}
                      >
                        Read Article
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div
            className="mx-auto text-center rounded-3xl p-12 shadow-sm border border-gray-100"
            style={{ maxWidth: '700px', background: '#fdf8f8' }}
          >
            <h2
              className="font-bold text-gray-900 mb-4"
              style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2rem)' }}
            >
              Stay Updated
            </h2>
            <p className="text-gray-500 mb-8" style={{ fontSize: '1.05rem' }}>
              Subscribe for the latest news, insights, and project updates from Nav Nirmiti Constructions.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4"
              onSubmit={e => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-grow px-5 py-4 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="text-white font-bold py-4 px-8 rounded-xl text-base transition whitespace-nowrap shadow"
                style={{ background: '#450a0a' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#5e0e0e')}
                onMouseLeave={e => (e.currentTarget.style.background = '#450a0a')}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
