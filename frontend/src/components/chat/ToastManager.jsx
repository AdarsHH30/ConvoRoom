import React, { useState, useCallback, useEffect } from "react";

const TOAST_DURATION = 1500;
const TOAST_FADE_DURATION = 300;

const Toast = React.memo(({ message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white py-2 px-4 rounded-md z-50 animate-fade-in">
      {message}
    </div>
  );
});

Toast.displayName = "Toast";

const ToastManager = React.memo(() => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Expose addToast globally
  useEffect(() => {
    window.showToast = addToast;
    return () => {
      window.showToast = null;
    };
  }, [addToast]);

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
});

ToastManager.displayName = "ToastManager";

export default ToastManager;
