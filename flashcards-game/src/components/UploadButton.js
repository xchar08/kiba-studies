import React from 'react';

const UploadButton = ({ handleClick }) => {
  return (
    <button
      onClick={handleClick}
      className="p-3 bg-blue-600 text-white rounded-lg mb-4 w-full max-w-md text-center text-lg hover:bg-blue-700"
    >
      Upload and Generate
    </button>
  );
};

export default UploadButton;
