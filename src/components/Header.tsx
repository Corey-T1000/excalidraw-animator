import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-purple-600 text-white p-4 mb-6">
      <h1 className="text-3xl font-bold">Excalidraw Animator</h1>
      <p className="mt-2">Upload an Excalidraw file, add animations, and export your creation!</p>
    </header>
  );
};

export default Header;