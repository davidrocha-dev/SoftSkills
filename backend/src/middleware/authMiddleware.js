const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
      }

      let selectedRole = req.headers['x-selected-role'];
      
      if (!selectedRole) {
        if (decoded.roles.includes('gestor')) {
          selectedRole = 'gestor';
        } else if (decoded.roles.includes('formador')) {
          selectedRole = 'formador';
        } else {
          selectedRole = 'formando';
        }
        
        console.log(`Role determinado automaticamente: ${selectedRole}`);
      }

      if (!decoded.roles.includes(selectedRole)) {
        return res.status(403).json({ message: 'Função selecionada inválida para este utilizador' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(selectedRole)) {
        return res.status(403).json({ message: 'Acesso negado para esta função' });
      }

      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Utilizador não encontrado.' });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles,
        selectedRole,
        workerNumber: user.workerNumber
      };

      next();
    } catch (error) {
      console.error('Erro no middleware de autorização:', error);
      return res.status(401).json({ message: 'Erro de autorização' });
    }
  };
};

const verifyToken = authorize();

module.exports = {
  authorize,
  verifyToken
};
