
import React from 'react';
import { AnalysisJob } from '../types';
import { CheckCircleIcon, AlertCircleIcon } from './Icons';

interface JobSidebarProps {
  jobs: AnalysisJob[];
  selectedJobId: string | null;
  onSelectJob: (id: string) => void;
  onAddNew: () => void;
}

const JobSidebar: React.FC<JobSidebarProps> = ({ jobs, selectedJobId, onSelectJob, onAddNew }) => {
  return (
    <div className="w-full lg:w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-gray-700">分析任务列表 ({jobs.length})</h3>
        <button 
          onClick={onAddNew}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          + 新增
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => onSelectJob(job.id)}
            className={`p-3 rounded-lg cursor-pointer border transition-all ${
              selectedJobId === job.id
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 shrink-0">
                {job.status === 'analyzing' && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
                {job.status === 'completed' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                {job.status === 'error' && <AlertCircleIcon className="w-5 h-5 text-red-500" />}
                {job.status === 'pending' && <div className="w-4 h-4 rounded-full bg-gray-200"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${selectedJobId === job.id ? 'text-blue-900' : 'text-gray-700'}`}>
                  {job.file.name}
                </p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500 capitalize">
                    {job.status === 'analyzing' ? '分析中...' : 
                     job.status === 'completed' ? '已完成' :
                     job.status === 'error' ? '失败' : '等待中'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(job.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobSidebar;
