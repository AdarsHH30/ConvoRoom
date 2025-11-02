import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

export const ConnectionLoadingOverlay = () => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowSpinner(true);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!showSpinner) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[var(--background)] p-6 rounded-lg shadow-xl">
        <LoadingSpinner text="Connecting to room..." />
        <p className="text-center mt-2 text-sm text-gray-500">
          Please wait while we establish connection...
        </p>
      </div>
    </div>
  );
};
