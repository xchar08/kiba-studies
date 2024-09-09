import React from 'react';

const Flashcard = ({ answer, handleClick }) => {
  return (
    <div
      className="flashcard bg-white shadow-lg rounded-lg border border-gray-200 p-6 m-4 text-center text-2xl font-semibold cursor-pointer transition-transform transform hover:-translate-y-2 hover:bg-blue-50"
      onClick={() => handleClick(answer)}
    >
      {answer}
    </div>
  );
};

export default Flashcard;
