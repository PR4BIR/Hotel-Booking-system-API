// d:\hotel\hotel-reservation-ui\src\components\layout\Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Hotel Reservation System</h3>
            <p className="text-gray-400 mt-1">Book your perfect stay with us</p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Hotel Reservation. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;