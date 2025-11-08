import React from 'react';
import { Link } from 'react-router-dom';
import type { Room } from '../../types';

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <img 
        src={room.images[0] || 'https://placehold.co/600x400?text=Room+Image'} 
        alt={room.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium">{room.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
            {room.type}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {room.amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold">${room.price}</span>
            <span className="text-gray-600 text-sm"> / night</span>
          </div>
          
          <Link
            to={`/rooms/${room.id}`}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;