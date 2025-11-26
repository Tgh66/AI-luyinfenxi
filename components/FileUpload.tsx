
import React from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, disabled }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      validateAndUpload(droppedFiles);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      validateAndUpload(selectedFiles);
    }
  };

  const validateAndUpload = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (validFiles.length !== files.length) {
      alert(`已忽略 ${files.length - validFiles.length} 个非音频文件。`);
    }

    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    } else if (files.length > 0) {
        alert('请上传有效的音频文件 (MP3, WAV, M4A)。');
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
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <UploadIcon className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        批量上传销售录音
      </h3>
      <p className="text-gray-500 text-center max-w-sm mb-4">
        拖放多个音频文件到此处 (MP3, WAV, M4A)，或点击选择。
      </p>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
        选择文件
      </button>
    </div>
  );
};

export default FileUpload;
