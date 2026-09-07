import React from 'react';
import { Link } from 'react-router-dom';
import { UserGroupIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import './PageHero.css';

const About = () => {
  const values = [
    {
      icon: <LightBulbIcon className="h-10 w-10 text-primary-600" />,
      title: "Innovation",
      description: "We constantly innovate to bring cutting-edge solutions to the construction industry."
    },
    {
      icon: <ChartBarIcon className="h-10 w-10 text-primary-600" />,
      title: "Excellence",
      description: "We strive for excellence in every project, ensuring the highest quality standards."
    },
    {
      icon: <UserGroupIcon className="h-10 w-10 text-primary-600" />,
      title: "Integrity",
      description: "We conduct business with honesty, transparency, and ethical practices."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="page-hero">
        <div className="page-hero-overlay" />
        <div className="container mx-auto px-4 text-center page-hero-content">
          <h1 className="page-hero-title">About Nav Nirmiti Constructions</h1>
          <p className="page-hero-sub">
            Building dreams into reality with over 25 years of excellence in construction.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 shadow-lg" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 font-serif">Our Legacy</h2>
              <p className="text-gray-600 mb-6">
                Nav Nirmiti Constructions, under the visionary leadership of Er. Ramchandra P. More, has been a trusted name in the construction industry for over 25 years. Our journey began with a passion for building and a commitment to excellence.
              </p>
              <p className="text-gray-600 mb-6">
                With over 25 commercial projects and 250+ residential projects completed, we have established ourselves as pioneers in delivering quality construction solutions. Our expertise spans across Residential Buildings, Commercial Complexes, Interior Design, Renovation, Infrastructure Projects, Apartments, and Hotels.
              </p>
              <p className="text-gray-600">
                Every project we undertake is conceptualized and executed according to Vastu Shastra principles, blending traditional wisdom with modern practices to create functional, aesthetic, and lasting structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">Meet Our Founder</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The visionary behind our success and commitment to excellence.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-96 mx-auto shadow-lg" />
            </div>
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Er. Ramchandra P. More</h3>
              <p className="text-primary-600 font-semibold mb-6">Founder & Chief Executive Officer</p>
              <p className="text-gray-600 mb-6">
                With over two decades of experience in the construction industry, Er. Ramchandra P. More is a renowned civil engineer and entrepreneur who founded Nav Nirmiti Constructions with a vision to revolutionize the construction landscape.
              </p>
              <p className="text-gray-600 mb-6">
                His expertise in combining traditional Vastu principles with modern construction techniques has led to the successful completion of hundreds of projects, earning the trust and satisfaction of countless clients.
              </p>
              <p className="text-gray-600">
                Under his leadership, Nav Nirmiti Constructions has grown from a small venture to a reputable construction company known for its quality, reliability, and innovative approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our work and define our character.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition duration-300">
                <div className="flex justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Structure */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">Our Team Structure</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A collaborative team of professionals dedicated to delivering exceptional results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition duration-300">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Engineers</h3>
              <p className="text-gray-600">Expert civil and structural engineers ensuring technical excellence.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition duration-300">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Architects</h3>
              <p className="text-gray-600">Creative designers transforming visions into beautiful structures.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition duration-300">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Technical Support</h3>
              <p className="text-gray-600">Specialists providing technical expertise throughout projects.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition duration-300">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Field Employees</h3>
              <p className="text-gray-600">Skilled workers executing projects with precision and care.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/careers" 
              className="inline-block bg-gradient-to-r from-primary-600 to-luxury-600 hover:from-primary-700 hover:to-luxury-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg"
            >
              Join Our Team
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default About;