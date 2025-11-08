import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle scroll effect for transparent to solid navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Changed from 'fixed' to 'sticky top-0' to make the navbar stick to the top
  const headerClass = location.pathname === '/' && !scrolled
    ? 'sticky top-0 w-full z-50 transition-all duration-300 bg-gradient-to-r from-blue-900/95 to-blue-800/95 backdrop-blur-md'
    : 'sticky top-0 w-full z-50 transition-all duration-300 bg-gradient-to-r from-blue-800 to-blue-700 shadow-md';

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center group">
            {/* Add shine animation to logo */}
            <div className="relative overflow-hidden rounded-full p-1 bg-gradient-to-r from-blue-400 to-blue-600 group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300">
              <svg 
                className="w-7 h-7 text-white group-hover:text-blue-50 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>
            </div>
            <div className="ml-2">
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors duration-300">
                Luxury Hotel
              </span>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-200 to-transparent transition-all duration-300"></div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/rooms">Rooms</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            
            {isAuthenticated ? (
              <div className="relative ml-2 group">
                <button className="flex items-center px-4 py-2 text-white rounded-full hover:bg-white/10 transition-colors duration-200">
                  <span className="mr-1">{user?.username}</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <Link to="/reservations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Reservations
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile Settings
                    </Link>
                    
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-indigo-600 border-t border-gray-100 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <button 
                      onClick={logout} 
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 border-t border-gray-100 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center ml-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-white rounded-md hover:bg-white/10 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {!mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-3 space-y-1 border-t border-blue-500/30 mt-4">
                <MobileNavLink to="/">Home</MobileNavLink>
                <MobileNavLink to="/rooms">Rooms</MobileNavLink>
                <MobileNavLink to="/about">About</MobileNavLink>
                <MobileNavLink to="/contact">Contact</MobileNavLink>
                
                {isAuthenticated ? (
                  <>
                    <div className="pt-2 pb-1">
                      <p className="px-3 text-xs font-medium uppercase tracking-wider text-blue-200">
                        Account
                      </p>
                    </div>
                    <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                    <MobileNavLink to="/reservations">My Reservations</MobileNavLink>
                    <MobileNavLink to="/profile">Profile Settings</MobileNavLink>
                    
                    {user?.role === 'admin' && (
                      <MobileNavLink to="/admin" isAdmin>Admin Dashboard</MobileNavLink>
                    )}
                    
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-300 hover:text-white hover:bg-blue-600 rounded-md transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col pt-4 space-y-2">
                    <Link 
                      to="/login" 
                      className="px-3 py-2 text-center text-white border border-blue-500 rounded-md hover:bg-blue-700 transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      className="px-3 py-2 text-center bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-md transition-all duration-200"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

// Desktop Navigation Link Component with hover effect
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className="relative group"
    >
      <div className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive 
          ? 'text-white bg-white/20' 
          : 'text-blue-100 hover:text-white'
      }`}>
        {children}
        {!isActive && (
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 group-hover:w-full transition-all duration-300"></span>
        )}
      </div>
    </Link>
  );
};

// Mobile Navigation Link Component
const MobileNavLink: React.FC<{ 
  to: string; 
  children: React.ReactNode;
  isAdmin?: boolean;
}> = ({ to, children, isAdmin = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`block px-3 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
        isActive 
          ? 'text-white bg-blue-600' 
          : isAdmin
            ? 'text-indigo-300 hover:text-white hover:bg-blue-600'
            : 'text-blue-100 hover:text-white hover:bg-blue-600'
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;