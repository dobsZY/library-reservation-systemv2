import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { Card, OccupancyBar } from '../common';
import type { HallOccupancy } from '../../types';

interface HallCardProps {
  hall: HallOccupancy;
  onClick: () => void;
}

export const HallCard: React.FC<HallCardProps> = ({ hall, onClick }) => {
  return (
    <Card hover onClick={onClick} className="group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-selcuk-blue transition-colors">
            {hall.hallName}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <MapPin size={14} />
            <span>{hall.floor}. Kat</span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm">
            <Users size={14} className="text-gray-400" />
            <span className="font-medium text-gray-700">
              {hall.availableTables} boş
            </span>
          </div>
          {hall.soonAvailable > 0 && (
            <span className="text-xs text-orange-600">
              +{hall.soonAvailable} yakında
            </span>
          )}
        </div>
      </div>
      
      <OccupancyBar percentage={hall.occupancyRate} size="sm" />
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-500">
          {hall.occupiedTables}/{hall.totalTables} masa dolu
        </span>
        <span className="text-sm font-medium text-selcuk-blue group-hover:underline">
          Görüntüle →
        </span>
      </div>
    </Card>
  );
};

