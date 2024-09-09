import React from 'react';

const GifDisplay = ({ gifUrl }) => {
  return (
    <div className="flex justify-center items-center mb-6">
      <img
        src={gifUrl}
        alt="Random Gif"
        className="max-w-full max-h-64 rounded-lg shadow-md"
      />
    </div>
  );
};

export default GifDisplay;
