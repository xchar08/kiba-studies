import React from 'react';

const FlashcardContainer = ({ question, answers, handleAnswer }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Display the question */}
      <div className="bg-white shadow-lg rounded-lg p-6 m-4 text-center text-2xl font-semibold">
        {question}
      </div>

      {/* Display the answers as clickable cards */}
      <div className="flex flex-wrap justify-center">
        {answers.map((answer, index) => (
          <div
            key={index}
            className="flashcard bg-white shadow-lg rounded-lg border border-gray-200 p-6 m-4 text-center text-2xl font-semibold cursor-pointer transition-transform transform hover:-translate-y-2 hover:bg-blue-50"
            onClick={() => handleAnswer(answer)}
          >
            {answer}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardContainer;
