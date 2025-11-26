import React from 'react';
import { CoachingInsight } from '../types';
import { CheckCircleIcon, AlertCircleIcon } from './Icons';

interface CoachingCardProps {
  strengths: CoachingInsight[];
  improvements: CoachingInsight[];
}

const CoachingCard: React.FC<CoachingCardProps> = ({ strengths, improvements }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Strengths */}
      <div className="bg-green-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center gap-2 mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-green-900">精彩时刻 (亮点)</h3>
        </div>
        <div className="space-y-4">
          {strengths.map((item, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
              <h4 className="font-medium text-green-800 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-4">
            <AlertCircleIcon className="w-6 h-6 text-orange-600" />
            <h3 className="font-semibold text-orange-900">错失良机 (改进)</h3>
        </div>
        <div className="space-y-4">
          {improvements.map((item, idx) => (
            <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-orange-100">
              <h4 className="font-medium text-orange-800 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachingCard;