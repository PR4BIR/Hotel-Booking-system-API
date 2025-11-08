import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminNav: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      <div className="flex overflow-x-auto">
        <NavLink
          to="/admin"
          className={({ isActive }) => 
            `px-4 py-2 whitespace-nowrap ${isActive ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`
          }
          end
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/reservations"
          className={({ isActive }) => 
            `px-4 py-2 whitespace-nowrap ${isActive ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Reservations
        </NavLink>
        <NavLink
          to="/admin/rooms"
          className={({ isActive }) => 
            `px-4 py-2 whitespace-nowrap ${isActive ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Rooms
        </NavLink>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => 
            `px-4 py-2 whitespace-nowrap ${isActive ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Users
        </NavLink>
        <NavLink
          to="/admin/reports"
          className={({ isActive }) => 
            `px-4 py-2 whitespace-nowrap ${isActive ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`
          }
        >
          Reports
        </NavLink>
      </div>
    </div>
  );
};

export default AdminNav;