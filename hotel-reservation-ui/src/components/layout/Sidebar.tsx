// d:\hotel\hotel-reservation-ui\src\components\layout\Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="h-full p-4 bg-gray-100 border-r">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary-700">Hotel Reservation</h2>
          {user && (
            <p className="text-sm text-gray-600 mt-1">Welcome, {user.username}</p>
          )}
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-200'}`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/reservations" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-200'}`
                }
              >
                Reservations
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/profile" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-md ${isActive 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-200'}`
                }
              >
                Profile
              </NavLink>
            </li>
            {user?.role === 'admin' && (
              <li>
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => 
                    `block px-4 py-2 rounded-md ${isActive 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:bg-gray-200'}`
                  }
                >
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;