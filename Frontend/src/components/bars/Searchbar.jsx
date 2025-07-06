import React from 'react';

const Searchbar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="px-4 py-2">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
      />
    </div>
  );
};

export default Searchbar;
