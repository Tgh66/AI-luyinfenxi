import React from 'react';
import { TranscriptLine } from '../types';
import { UserIcon } from './Icons';

interface TranscriptViewProps {
  transcript: TranscriptLine[];
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-800">Transcript</h3>
      </div>
      <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-1">
        {transcript.map((line, index) => {
          const isSales = line.speaker.toLowerCase().includes('sales');
          return (
            <div key={index} className={`flex gap-3 ${isSales ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isSales ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                }`}
                title={line.speaker}
              >
               <UserIcon className="w-4 h-4" />
              </div>
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  isSales
                    ? 'bg-blue-50 text-gray-800 rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold ${isSales ? 'text-blue-700' : 'text-orange-700'}`}>
                        {line.speaker}
                    </span>
                    <span className="text-xs text-gray-400">{line.timestamp}</span>
                </div>
                <p className="leading-relaxed">{line.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptView;
