import React, { useState } from 'react';
import { AppState, AnalysisResult } from './types';
import { analyzeSalesCall } from './services/geminiService';
import FileUpload from './components/FileUpload';
import AudioRecorder from './components/AudioRecorder';
import TranscriptView from './components/TranscriptView';
import SentimentChart from './components/SentimentChart';
import CoachingCard from './components/CoachingCard';
import { SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileSelect = async (file: File) => {
    setCurrentFile(file);
    setState(AppState.ANALYZING);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          // Extract base64 part
          const base64String = (reader.result as string).split(',')[1];
          // Determine mime type (recorder might produce 'audio/webm' which Gemini supports)
          const analysis = await analyzeSalesCall(base64String, file.type);
          setResult(analysis);
          setState(AppState.COMPLETE);
        } catch (err: any) {
          setErrorMsg(err.message || "Failed to analyze audio");
          setState(AppState.ERROR);
        }
      };
      reader.onerror = () => {
        setErrorMsg("Failed to read file");
        setState(AppState.ERROR);
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setErrorMsg(e.message);
      setState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setState(AppState.IDLE);
    setResult(null);
    setCurrentFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="bg-blue-600 p-2 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              SalesIQ
            </h1>
          </div>
          {state !== AppState.IDLE && (
            <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-blue-600 font-medium"
            >
                New Analysis
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {state === AppState.IDLE && (
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Unlock the potential of every conversation
            </h2>
            <p className="text-gray-500 mb-12 text-lg max-w-2xl mx-auto">
              Upload your sales call recordings or record directly to get instant diarized transcripts, 
              sentiment analysis, and AI-driven coaching tips.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload onFileSelect={handleFileSelect} />
                <AudioRecorder onRecordingComplete={handleFileSelect} />
            </div>

            <div className="mt-8 flex justify-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                    <span>Powered by Gemini 2.5</span>
                </div>
                <div>Secure Processing</div>
                <div>Instant Results</div>
            </div>
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="max-w-xl mx-auto mt-20 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Audio...</h3>
            <p className="text-gray-500">
                Listening to {currentFile?.name || 'recording'}... <br/>
                Identifying speakers and gauging sentiment. This may take a moment.
            </p>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="max-w-xl mx-auto mt-20 text-center bg-red-50 p-8 rounded-2xl border border-red-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Analysis Failed</h3>
            <p className="text-red-700 mb-6">{errorMsg}</p>
            <button
              onClick={handleReset}
              className="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {state === AppState.COMPLETE && result && (
          <div className="space-y-6">
            {/* Top Summary Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Executive Summary</h2>
              <p className="text-gray-600 leading-relaxed">{result.coaching.summary}</p>
            </div>

            {/* Coaching Cards */}
            <CoachingCard 
                strengths={result.coaching.strengths} 
                improvements={result.coaching.improvements} 
            />

            {/* Split View: Transcript and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <TranscriptView transcript={result.transcript} />
              </div>
              <div className="lg:col-span-2 space-y-6">
                 <SentimentChart data={result.sentimentGraph} />
                 
                 {/* Additional stats */}
                 <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-700">{result.transcript.length}</div>
                        <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Turns</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-indigo-700">
                            {result.sentimentGraph.length > 0 
                                ? Math.round(result.sentimentGraph.reduce((acc, curr) => acc + curr.score, 0) / result.sentimentGraph.length)
                                : 0}
                        </div>
                        <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">Avg Sentiment</div>
                    </div>
                     <div className="bg-purple-50 p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-purple-700">2</div>
                        <div className="text-xs text-purple-600 font-medium uppercase tracking-wide">Speakers</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;