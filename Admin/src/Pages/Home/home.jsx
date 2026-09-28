import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isEmployee } from '../../Utils/auth';

const Home = () => {
  const navigate = useNavigate();
  const adminStr = localStorage.getItem("Admin");
  const admin = adminStr && adminStr !== "undefined" ? JSON.parse(adminStr) : null;

  // Redirect employees to their portal immediately on landing
  useEffect(() => {
    if (isEmployee()) {
      navigate("/employee-portal", { replace: true });
    }
  }, []);

  return (
    <div className="bg-gray-100 flex items-center justify-center" style={{minHeight:"60vh"}}>
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {admin ? `Welcome, ${admin?.name}` : "Welcome to Admin Panel"}
        </h1>
        <p className="text-lg text-gray-600">
          {admin ? "You are successfully logged in!" : "Please login first!"}
        </p>
      </div>
    </div>
  );
};

export default Home;
