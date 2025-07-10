// src/components/Notification.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState(null);
  const [type, setType] = useState('info');

  const notify = useCallback((msg, variant = 'info') => {
    setMessage(msg);
    setType(variant);
    setTimeout(() => setMessage(null), 4000);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {message && <Toast message={message} type={type} />}
    </NotificationContext.Provider>
  );
}

function Toast({ message, type }) {
  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        padding: '0.75rem 1.25rem',
        backgroundColor: type === 'error' ? '#f8d7da' : '#d1ecf1',
        color: type === 'error' ? '#721c24' : '#0c5460',
        border: '1px solid',
        borderColor: type === 'error' ? '#f5c6cb' : '#bee5eb',
        borderRadius: '0.25rem',
        zIndex: 9999
      }}
    >
      {message}
    </div>,
    document.body
  );
}
