import React, { useState } from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import { submitContactForm, submitQuoteRequest } from '../utils/api';
import './PageHero.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [quoteData, setQuoteData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    budget: '',
    timeline: '',
    details: ''
  });

  const [formStatus, setFormStatus] = useState({ contact: null, quote: null });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuoteChange = (e) => {
    setQuoteData({
      ...quoteData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ ...formStatus, contact: 'submitting' });
    
    try {
      const response = await submitContactForm(formData);
      if (response.success) {
        setFormStatus({ ...formStatus, contact: 'success' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        // Clear success message after 5 seconds
        setTimeout(() => setFormStatus({ ...formStatus, contact: null }), 5000);
      } else {
        setFormStatus({ ...formStatus, contact: 'error' });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormStatus({ ...formStatus, contact: 'error' });
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ ...formStatus, quote: 'submitting' });
    
    try {
      const response = await submitQuoteRequest(quoteData);
      if (response.success) {
        setFormStatus({ ...formStatus, quote: 'success' });
        setQuoteData({
          name: '',
          email: '',
          phone: '',
          projectType: '',
          budget: '',
          timeline: '',
          details: ''
        });
        // Clear success message after 5 seconds
        setTimeout(() => setFormStatus({ ...formStatus, quote: null }), 5000);
      } else {
        setFormStatus({ ...formStatus, quote: 'error' });
      }
    } catch (error) {
      console.error('Error submitting quote request:', error);
      setFormStatus({ ...formStatus, quote: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-4 text-center page-hero-content">
          <h1 className="page-hero-title">Contact Us</h1>
          <p className="page-hero-sub">
            Have a project in mind? Get in touch with us for a free consultation and quote.
          </p>
        </div>
      </section>


      {/* Contact & Quote Forms */}
      <section className="py-10 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-8 font-display">Send us a Message</h2>
              {formStatus.contact === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  Thank you for your message! We will contact you soon.
                </div>
              )}
              {formStatus.contact === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  There was an error submitting your message. Please try again.
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-3 text-lg">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-3 text-lg">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-3 text-lg">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-3 text-lg">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-3 text-lg">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-luxury-600 hover:from-primary-700 hover:to-luxury-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 w-full flex items-center justify-center shadow-lg"
                  disabled={formStatus.contact === 'submitting'}
                >
                  {formStatus.contact === 'submitting' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            </div>
            
            {/* Quote Request Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-8 font-display">Request a Quote</h2>
              {formStatus.quote === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                  Thank you for your quote request! We will contact you soon.
                </div>
              )}
              {formStatus.quote === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  There was an error submitting your quote request. Please try again.
                </div>
              )}
              <form onSubmit={handleQuoteSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="quoteName" className="block text-gray-700 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      id="quoteName"
                      name="name"
                      value={quoteData.name}
                      onChange={handleQuoteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quoteEmail" className="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      id="quoteEmail"
                      name="email"
                      value={quoteData.email}
                      onChange={handleQuoteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quotePhone" className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      id="quotePhone"
                      name="phone"
                      value={quoteData.phone}
                      onChange={handleQuoteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="projectType" className="block text-gray-700 font-medium mb-2">Project Type</label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={quoteData.projectType}
                      onChange={handleQuoteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Project Type</option>
                      <option value="residential">Residential Building</option>
                      <option value="commercial">Commercial Complex</option>
                      <option value="interior">Interior Design</option>
                      <option value="renovation">Renovation</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-gray-700 font-medium mb-2">Estimated Budget</label>
                    <select
                      id="budget"
                      name="budget"
                      value={quoteData.budget}
                      onChange={handleQuoteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Budget Range</option>
                      <option value="10-50k">₹10,000 - ₹50,000</option>
                      <option value="50-100k">₹50,000 - ₹1,00,000</option>
                      <option value="1-5l">₹1,00,000 - ₹5,00,000</option>
                      <option value="5-10l">₹5,00,000 - ₹10,00,000</option>
                      <option value="10l+">₹10,00,000+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="timeline" className="block text-gray-700 font-medium mb-2">Project Timeline</label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={quoteData.timeline}
                      onChange={handleQuoteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Timeline</option>
                      <option value="1-3m">1-3 Months</option>
                      <option value="3-6m">3-6 Months</option>
                      <option value="6-12m">6-12 Months</option>
                      <option value="12m+">12+ Months</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="details" className="block text-gray-700 font-medium mb-2">Project Details</label>
                  <textarea
                    id="details"
                    name="details"
                    value={quoteData.details}
                    onChange={handleQuoteChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Please provide details about your project requirements..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary-600 to-luxury-600 hover:from-primary-700 hover:to-luxury-700 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 w-full flex items-center justify-center shadow-lg"
                  disabled={formStatus.quote === 'submitting'}
                >
                  {formStatus.quote === 'submitting' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Requesting...
                    </>
                  ) : 'Request Quote'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">Visit Our Office</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Come visit our office to discuss your project in person. We're here to help you build your dream space.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="w-full h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center px-4">
                <MapPinIcon className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Office Location</h3>
                <p className="text-lg text-gray-600 mb-1">Om Sai, Plot No.13, Vetalba Nagar</p>
                <p className="text-lg text-gray-600 mb-4">Miraj, Maharashtra</p>
                <a
                  href="https://maps.app.goo.gl/zNxzHi3GArbxQVCX8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;