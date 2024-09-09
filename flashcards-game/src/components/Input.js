import React from 'react';

const Input = ({ type, placeholder, onChange, accept }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      accept={accept}
      onChange={onChange}
      className="p-3 border border-gray-300 rounded-lg mb-6 w-full max-w-md text-center text-lg"
    />
  );
};

export default Input;
