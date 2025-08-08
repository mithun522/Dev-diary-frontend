import React from "react";

const ErrorPage: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = "Something went wrong.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
      <img
        src="https://cdn-icons-png.flaticon.com/512/564/564619.png"
        alt="Error"
        className="w-32 h-32 mb-6 opacity-80"
      />
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">{message}</h1>
      <p className="text-gray-600 mb-6">Please try again later.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorPage;
