import React from 'react';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon, WrenchIcon, HomeModernIcon, ArrowsPointingOutIcon, BuildingLibraryIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import './PageHero.css';

const Services = () => {
  const services = [
    {
      icon: <BuildingOfficeIcon className="h-12 w-12 text-primary-600" />,
      title: "Construction",
      description: "Complete civil and structural works for residential and commercial projects.",
      features: [
        "Foundation and structural work",
        "Building construction",
        "Roofing and waterproofing",
        "Electrical and plumbing installations",
        "Finishing and painting"
      ]
    },
    {
      icon: <WrenchIcon className="h-12 w-12 text-primary-600" />,
      title: "Consulting",
      description: "Professional guidance and project management from planning to execution.",
      features: [
        "Project feasibility analysis",
        "Design consultation",
        "Cost estimation and budgeting",
        "Project scheduling and management",
        "Quality control and supervision"
      ]
    },
    {
      icon: <HomeModernIcon className="h-12 w-12 text-primary-600" />,
      title: "Interior Designing",
      description: "Creative and functional interior solutions for residential and commercial spaces.",
      features: [
        "Space planning and layout design",
        "Furniture and fixture selection",
        "Color and material consultation",
        "Lighting design",
        "Custom cabinetry and millwork"
      ]
    }
  ];

  const expertiseAreas = [
    "Residential Buildings",
    "Commercial Complexes",
    "Interior Design",
    "Renovation",
    "Infrastructure Projects",
    "Apartments",
    "Hotels"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-4 text-center page-hero-content">
          <h1 className="page-hero-title">Our Services</h1>
          <p className="page-hero-sub">
            Comprehensive construction solutions tailored to meet your specific needs and exceed your expectations.
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden group"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: "0 25px 50px -12px rgba(133, 14, 14, 0.25)"
                }}
              >
                {/* Luxury gradient border effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-600/10 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                
                {/* Animated icon */}
                <motion.div 
                  className="mb-6 relative z-10"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {service.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4 relative z-10 group-hover:text-primary-700 transition-colors duration-300">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-6 relative z-10 group-hover:text-gray-800 transition-colors duration-300">
                  {service.description}
                </p>
                
                <ul className="space-y-3 relative z-10">
                  {service.features.map((feature, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-start group-hover:translate-x-1 transition-transform duration-300"
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                      >
                        <ArrowsPointingOutIcon className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0 group-hover:text-primary-700 transition-colors duration-300" />
                      </motion.div>
                      <span className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* Floating action indicator */}
                <motion.div
                  className="absolute bottom-4 right-4 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">Areas of Expertise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              With over 25 years of experience, we specialize in a wide range of construction domains.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {expertiseAreas.map((area, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center hover:shadow-lg transition duration-300">
                <BuildingLibraryIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                <span className="font-medium text-gray-800">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">Our Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We follow a systematic approach to ensure quality and timely delivery of every project.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Consultation</h3>
              <p className="text-gray-600">Understanding your requirements and project scope.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Planning</h3>
              <p className="text-gray-600">Developing detailed plans and designs.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Execution</h3>
              <p className="text-gray-600">Implementing the project with precision.</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-primary-600">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Delivery</h3>
              <p className="text-gray-600">Final inspection and project handover.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vastu Integration */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-luxury-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 shadow-lg" />
            </div>
            <div className="md:w-1/2 md:pl-16">
              <h2 className="text-3xl font-bold mb-6 font-serif">Vastu Shastra Integration</h2>
              <p className="text-gray-100 mb-6">
                Every project at Nav Nirmiti Constructions is conceptualized and executed according to Vastu Shastra principles, blending traditional wisdom with modern practices.
              </p>
              <p className="text-gray-100 mb-8">
                This ancient Indian science of architecture ensures harmony between humans and their built environment, creating spaces that promote health, wealth, and happiness.
              </p>
              <div className="flex items-center">
                <ArrowPathIcon className="h-10 w-10 mr-4" />
                <span className="text-xl font-semibold">Traditional Wisdom, Modern Excellence</span>
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

export default Services;