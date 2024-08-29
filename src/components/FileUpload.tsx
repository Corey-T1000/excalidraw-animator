import React, { useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  children: ({ openFileDialog }: { openFileDialog: () => void }) => React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".excalidraw"
        className="hidden"
      />
      {children({ openFileDialog })}
    </>
  );
};

export default FileUpload;