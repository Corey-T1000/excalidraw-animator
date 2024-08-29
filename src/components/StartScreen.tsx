import React from 'react';
import FileUpload from './FileUpload';

interface StartScreenProps {
  onFileUpload: (file: File) => void;
  onCreateNew: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onFileUpload, onCreateNew }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Excalidraw Animator</h1>
      <div className="flex space-x-4">
        <button
          onClick={onCreateNew}
          className="w-48 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Create New File
        </button>
        <FileUpload onFileUpload={onFileUpload}>
          {({ openFileDialog }) => (
            <button
              onClick={openFileDialog}
              className="w-48 bg-transparent text-blue-500 border border-blue-500 py-2 px-4 rounded-md hover:bg-blue-50 transition duration-300"
            >
              Upload Excalidraw
            </button>
          )}
        </FileUpload>
      </div>
    </div>
  );
};

export default StartScreen;