import React from 'react';
const Home = () => {
  const admin = JSON.parse(localStorage.getItem("Admin"));
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{admin?"Welcome "+admin?.name:"Welcome to admin page"} </h1>
        <p className="text-lg text-gray-600">{admin ? "You are successfully logged in!" : "please Login first!"}</p>
      </div>
    </div>
  );
};

export default Home;