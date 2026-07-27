import React from 'react';

const ChipField = ({ fieldName, label, inputState, setInputState, watch, setValue, errors }) => {
  // Function to add a value to an array field
  const addToArray = () => {
    if (inputState.trim() !== '') {
      const currentArray = watch(fieldName) || [];
      setValue(fieldName, [...currentArray, inputState.trim()]);
      setInputState('');
    }
  };

  // Function to remove a value from an array field
  const removeFromArray = (index) => {
    const currentArray = watch(fieldName);
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    setValue(fieldName, newArray);
  };

  return (
    <div className="flex flex-col gap-1 col-span-2">
      <label className="block text-gray-300 font-medium">{label}</label>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {watch(fieldName)?.map((item, index) => (
          <div key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
            <span>{item}</span>
            <button
              type="button"
              onClick={() => removeFromArray(index)}
              className="text-white hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputState}
          onChange={(e) => setInputState(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addToArray();
            }
          }}
          className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
          placeholder={`Add a new ${label.toLowerCase().slice(0, -1)}...`}
        />
        <button
          type="button"
          onClick={addToArray}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
      {errors[fieldName] && <span className="text-red-500 text-sm mt-1">{errors[fieldName].message}</span>}
    </div>
  );
};

export default ChipField;