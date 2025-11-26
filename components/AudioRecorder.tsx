import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, StopCircleIcon } from './Icons';

interface AudioRecorderProps {
  onRecordingComplete: (file: File) => void;
  disabled?: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        // Create a File object from the Blob
        const file = new File([blob], "microphone-recording.webm", { type: 'audio/webm' });
        onRecordingComplete(file);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Reset and start timer
      setDuration(0);
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure you have granted permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl bg-white hover:bg-gray-50 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="bg-purple-100 p-4 rounded-full mb-4">
            <MicrophoneIcon className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Record Audio</h3>
        
        {!isRecording ? (
             <div className="flex flex-col items-center w-full">
                 <p className="text-gray-500 text-center max-w-sm mb-4">
                    Record your conversation directly from your browser.
                 </p>
                 <button 
                    onClick={startRecording}
                    disabled={disabled}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors w-full sm:w-auto"
                 >
                    Start Recording
                 </button>
             </div>
        ) : (
            <div className="flex flex-col items-center gap-4 w-full">
                <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-xl bg-red-50 px-4 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    {formatTime(duration)}
                </div>
                <button 
                    onClick={stopRecording}
                    className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-200 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors w-full sm:w-auto"
                >
                    <StopCircleIcon className="w-5 h-5" />
                    <span>Stop Recording</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default AudioRecorder;