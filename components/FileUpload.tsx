import React, { useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndUpload(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.type.startsWith('audio/')) {
      onFileSelect(file);
    } else {
      alert('Please upload a valid audio file.');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
      onClick={() => document.getElementById('audio-upload')?.click()}
    >
      <input
        type="file"
        id="audio-upload"
        accept="audio/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <UploadIcon className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Upload Sales Call Recording
      </h3>
      <p className="text-gray-500 text-center max-w-sm mb-4">
        Drag and drop your audio file here (MP3, WAV, M4A), or click to browse.
      </p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        Select File
      </button>
    </div>
  );
};

export default FileUpload;
