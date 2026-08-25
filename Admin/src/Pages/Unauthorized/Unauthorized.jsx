import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center px-6">
      <ShieldOff size={64} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-white mb-3">Access Denied</h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md">
        You don't have permission to view this page. Please contact your Super Admin if you think this is a mistake.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default Unauthorized;
