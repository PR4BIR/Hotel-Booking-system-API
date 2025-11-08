import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Luxury Hotel</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our story, our commitment to excellence, and what makes us the premier choice for discerning travelers.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Founded in 2005, Luxury Hotel began with a simple vision: to create a sanctuary of elegance where guests experience unparalleled hospitality. What started as a boutique establishment has evolved into one of the most prestigious hotel brands, recognized worldwide for our commitment to excellence.
          </p>
          <p className="text-gray-600">
            Our journey has been defined by a relentless pursuit of perfection in every detail, from architectural design to personalized service. Each of our properties reflects the unique character of its location while maintaining the signature luxury experience our guests have come to expect.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          <img 
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Luxury Hotel Exterior" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-blue-50 rounded-xl p-8 mb-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            At the core of everything we do are the principles that guide our operations and relationships.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-blue-600 mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Guest-Centric</h3>
            <p className="text-gray-600">
              We place our guests at the heart of everything we do, anticipating needs and exceeding expectations.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-blue-600 mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Global Excellence</h3>
            <p className="text-gray-600">
              We maintain the highest standards across all our properties worldwide, ensuring a consistent luxury experience.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-blue-600 mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Sustainability</h3>
            <p className="text-gray-600">
              We are committed to responsible luxury, implementing eco-friendly practices while maintaining opulence.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-xl overflow-hidden shadow-lg order-2 lg:order-1"
        >
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Luxury Hotel Interior" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-1 lg:order-2"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Commitment</h2>
          <p className="text-gray-600 mb-4">
            At Luxury Hotel, we're committed to creating moments of delight for our guests. Whether you're staying with us for business or leisure, our dedicated team ensures every detail is perfect, from the temperature of your room to the personalized amenities awaiting your arrival.
          </p>
          <p className="text-gray-600">
            We invest continually in our properties, staff training, and guest experience innovations to maintain our position as industry leaders. Our commitment extends beyond our walls to the communities we serve, with initiatives focused on local culture, heritage preservation, and economic development.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Join Us</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8">
          Experience the Luxury Hotel difference. We invite you to discover our world of refined elegance and unparalleled service. Your journey to extraordinary begins with us.
        </p>
        <a 
          href="/rooms" 
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Explore Our Accommodations
        </a>
      </motion.div>
    </div>
  );
};

export default About;