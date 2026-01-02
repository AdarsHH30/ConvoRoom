import React, { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { AlertTriangle, RefreshCw } from "lucide-react";

export const ConnectionLoadingOverlay = ({
  error = null,
  reconnectAttempts = 0,
  onRetry = null,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showError, setShowError] = useState(false);
  const hasError = !!error;
  const maxAttemptsReached = reconnectAttempts >= 5;

  useEffect(() => {
    // Show loading spinner after 2 seconds
    const spinnerTimeout = setTimeout(() => {
      setShowContent(true);
    }, 2000);

    return () => clearTimeout(spinnerTimeout);
  }, []);

  useEffect(() => {
    // Show error after 5 seconds of having an error
    if (hasError) {
      const errorTimeout = setTimeout(() => {
        setShowError(true);
      }, 5000);
      return () => clearTimeout(errorTimeout);
    } else {
      setShowError(false);
    }
  }, [hasError]);

  if (!showContent) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[var(--background)] p-5 rounded-lg shadow-xl max-w-sm mx-4 border border-gray-800">
        {showError && hasError ? (
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-3" />
            <p className="text-gray-300 text-sm mb-3">{error}</p>
            {maxAttemptsReached && onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        ) : (
          <>
            <LoadingSpinner text="Connecting..." fullScreen={false} />
            {reconnectAttempts > 0 && (
              <p className="text-center mt-2 text-xs text-gray-500">
                Attempt {reconnectAttempts}/5
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
