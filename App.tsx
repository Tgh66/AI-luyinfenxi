
import React, { useState } from 'react';
import { AnalysisJob } from './types';
import { analyzeSalesCall } from './services/geminiService';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import TranscriptView from './components/TranscriptView';
import SentimentChart from './components/SentimentChart';
import CoachingCard from './components/CoachingCard';
import JobSidebar from './components/JobSidebar';
import { SparklesIcon, AlertCircleIcon } from './components/Icons';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<AnalysisJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Helper to generate IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Core analysis function
  const processJob = async (jobId: string, file: File) => {
    // Update status to analyzing (in case it was retried)
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'analyzing', error: undefined } : j));

    try {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1];
                const analysis = await analyzeSalesCall(base64String, file.type);
                
                setJobs(prev => prev.map(j => 
                    j.id === jobId 
                        ? { ...j, status: 'completed', result: analysis } 
                        : j
                ));
            } catch (err: any) {
                setJobs(prev => prev.map(j => 
                    j.id === jobId 
                        ? { ...j, status: 'error', error: err.message || "分析失败" } 
                        : j
                ));
            }
        };
        reader.onerror = () => {
             setJobs(prev => prev.map(j => 
                j.id === jobId 
                    ? { ...j, status: 'error', error: "无法读取文件" } 
                    : j
            ));
        };
        reader.readAsDataURL(file);
    } catch (e: any) {
        setJobs(prev => prev.map(j => 
            j.id === jobId 
                ? { ...j, status: 'error', error: e.message } 
                : j
        ));
    }
  };

  const handleFilesAdd = (files: File[]) => {
    const newJobs: AnalysisJob[] = files.map(file => ({
        id: generateId(),
        file,
        status: 'analyzing', // Start immediately
        createdAt: Date.now()
    }));

    setJobs(prev => [...prev, ...newJobs]);
    
    // Auto-select the first new job if nothing is selected or if it's the first batch
    if (!selectedJobId && newJobs.length > 0) {
        setSelectedJobId(newJobs[0].id);
    } else if (newJobs.length > 0 && jobs.length === 0) {
        setSelectedJobId(newJobs[0].id);
    }

    // Trigger analysis for each new job concurrently
    newJobs.forEach(job => processJob(job.id, job.file));
  };

  // Wrapper for single file inputs (Recorder)
  const handleSingleFileAdd = (file: File) => {
      handleFilesAdd([file]);
  };

  const handleReset = () => {
    setJobs([]);
    setSelectedJobId(null);
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const isIdle = jobs.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-blue-600 p-2 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              SalesIQ 销售智能
            </h1>
          </div>
          {!isIdle && (
             <div className="text-sm text-gray-500">
                {jobs.filter(j => j.status === 'analyzing').length > 0 
                  ? `正在分析 ${jobs.filter(j => j.status === 'analyzing').length} 个任务...`
                  : '分析已完成'}
             </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Sidebar (Only visible when not idle) */}
        {!isIdle && (
            <div className="shrink-0 w-full lg:w-72 h-48 lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-gray-200">
                <JobSidebar 
                    jobs={jobs} 
                    selectedJobId={selectedJobId} 
                    onSelectJob={setSelectedJobId} 
                    onAddNew={() => setSelectedJobId(null)} 
                />
            </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 h-full">
            
            {/* Upload/Dashboard View */}
            {(isIdle || selectedJobId === null) ? ( 
               <div className="max-w-4xl mx-auto mt-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {isIdle ? '挖掘每一次对话的潜力' : '添加更多分析任务'}
                    </h2>
                    <p className="text-gray-500 mb-12 text-lg max-w-2xl mx-auto">
                    支持批量上传销售录音 (MP3, WAV, M4A) 或现场录音，AI 将为您并行分析。
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUpload onFilesSelect={handleFilesAdd} />
                        <AudioRecorder onRecordingComplete={handleSingleFileAdd} />
                    </div>
                    
                    {/* Return button if in workspace mode */}
                    {!isIdle && jobs.length > 0 && (
                        <button 
                            onClick={() => setSelectedJobId(jobs[jobs.length-1].id)}
                            className="mt-8 text-blue-600 hover:text-blue-800 underline"
                        >
                            返回分析结果
                        </button>
                    )}
                    
                    <div className="mt-8 flex justify-center gap-8 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <span>由 Gemini 2.5 驱动</span>
                        </div>
                        <div>安全处理</div>
                        <div>批量并行分析</div>
                    </div>
                </div>
            ) : selectedJob ? (
                // DETAIL VIEW for Selected Job
                <div className="space-y-6 max-w-5xl mx-auto pb-10">
                    
                    {/* Job Title Header */}
                    <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-gray-800 truncate max-w-2xl" title={selectedJob.file.name}>
                            {selectedJob.file.name}
                         </h2>
                         {selectedJob.status === 'error' && (
                             <button 
                                onClick={() => processJob(selectedJob.id, selectedJob.file)}
                                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                             >
                                重试
                             </button>
                         )}
                    </div>

                    {/* Loading State */}
                    {selectedJob.status === 'analyzing' && (
                         <div className="flex flex-col items-center justify-center h-96">
                             <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">正在分析音频...</h3>
                            <p className="text-gray-500">AI 正在生成逐字稿并提取洞察，请稍候。</p>
                         </div>
                    )}

                    {/* Error State */}
                    {selectedJob.status === 'error' && (
                         <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                            <AlertCircleIcon className="w-10 h-10 text-red-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-red-900">分析遇到问题</h3>
                            <p className="text-red-700">{selectedJob.error}</p>
                         </div>
                    )}

                    {/* Completed State */}
                    {selectedJob.status === 'completed' && selectedJob.result && (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">执行摘要</h2>
                                <p className="text-gray-600 leading-relaxed">{selectedJob.result.coaching.summary}</p>
                            </div>

                            <CoachingCard 
                                strengths={selectedJob.result.coaching.strengths} 
                                improvements={selectedJob.result.coaching.improvements} 
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <TranscriptView transcript={selectedJob.result.transcript} />
                                </div>
                                <div className="lg:col-span-2 space-y-6">
                                    <SentimentChart data={selectedJob.result.sentimentGraph} />
                                    
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-blue-700">{selectedJob.result.transcript.length}</div>
                                            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">对话轮次</div>
                                        </div>
                                        <div className="bg-indigo-50 p-4 rounded-xl text-center">
                                            <div className="text-2xl font-bold text-indigo-700">
                                                {selectedJob.result.sentimentGraph.length > 0 
                                                    ? Math.round(selectedJob.result.sentimentGraph.reduce((acc, curr) => acc + curr.score, 0) / selectedJob.result.sentimentGraph.length)
                                                    : 0}
                                            </div>
                                            <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">平均情感分</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;
