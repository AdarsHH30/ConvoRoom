import React from "react";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-md w-full">
        <h1 className="text-7xl font-extrabold tracking-tighter text-green-400 lg:text-9xl">
          404
        </h1>
        <h2 className="text-3xl font-bold tracking-tight text-green-300">
          Page Not Found
        </h2>
        <p className="text-green-200 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => window.history.back()}
          className="w-full px-6 py-3 bg-green-900  border-green-700 text-green-200 rounded-md hover:bg-green-800 hover:text-green-100 transition-colors duration-200 font-medium"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
