import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Access Denied</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        You don't have permission to access this page. Please contact the administrator
        if you believe this is an error.
      </p>
      <div className="space-x-4">
        <Link 
          to="/" 
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Home Page
        </Link>
        <Link 
          to="/dashboard" 
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;