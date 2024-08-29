import React from 'react';

interface StartScreenProps {
  onFileUpload: (file: File) => void;
  onCreateNew: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onFileUpload, onCreateNew }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="h-screen w-screen bg-white">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="mb-8">
          {/* Add your logo component here */}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Welcome to Excalidraw Animator
        </h1>
        <div className="flex gap-4">
          <button
            onClick={onCreateNew}
            className="flex items-center py-3 px-4 bg-[#6965db] text-white rounded-md cursor-pointer transition duration-300 hover:bg-[#5b57c2]"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-base">Create New Project</span>
          </button>
          <label
            className="flex items-center py-3 px-4 border-2 border-[#6965db] text-[#6965db] rounded-md cursor-pointer transition duration-300 hover:bg-[#6965db] hover:text-white"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-base">Upload File</span>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".excalidraw"
            />
          </label>
        </div>
      </div>
    </div>
  );
};