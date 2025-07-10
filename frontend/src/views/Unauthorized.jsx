import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="unauthorized">
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link to="/dashboard">Voltar para o dashboard</Link>
    </div>
  );
};

export default Unauthorized;