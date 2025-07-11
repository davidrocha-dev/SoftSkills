import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading = () => (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      background: '#fff'
    }}
  >
    <Spinner animation="border" variant="primary" role="status" style={{ width: 60, height: 60 }}>
      <span className="visually-hidden">Carregando...</span>
    </Spinner>
  </div>
);

export default Loading; 