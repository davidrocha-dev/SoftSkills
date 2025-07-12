const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op }  = require('sequelize');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ 
        error: 'Conta não verificada. Verifique seu email.' 
      });
    }

    if (user.forcePasswordChange) {
      const token = jwt.sign(
        { 
          userId: user.id, 
          changePassword: true,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      
      return res.json({ 
        requiresPasswordChange: true,
        token 
      });
    }

    if (!user.status) {
      return res.status(403).json({ 
        message: 'Conta desativada. Por favor, contacte o gestor.' 
      });
    }

    let roles = [];
    switch (user.primaryRole.toLowerCase()) {
      case 'gestor': 
        roles = ['gestor', 'formador', 'formando'];
        break;
      case 'formador': 
        roles = ['formador', 'formando'];
        break;
      default: 
        roles = ['formando'];
    }

    const { workerNumber } = user;
    
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        workerNumber,
        roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workerNumber,
        roles
      },
      message: 'Login realizado com sucesso!'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

exports.verifyAccount = async (req, res) => {
  const email = req.body.email || req.query.email;
  
  if (!email) {
    return res.status(400).json({ 
      success: false,
      error: 'Email é obrigatório' 
    });
  }

  console.log(`[VerifyAccount] Iniciando verificação para: ${email}`);
  
  try {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log(`[VerifyAccount] Utilizador não encontrado: ${email}`);
      return res.status(404).json({ 
        success: false,
        error: 'Utilizador não encontrado' 
      });
    }

    console.log(`[VerifyAccount] Status atual: isVerified=${user.isVerified}, id=${user.id}`);
    
    if (user.isVerified) {
      console.log(`[VerifyAccount] Utilizador já verificado: ${email}`);
      return res.json({ 
        success: true,
        message: 'Conta já verificada anteriormente' 
      });
    }

    await user.update({ isVerified: true });
    
    await user.reload();
    console.log(`[VerifyAccount] Status pós-atualização: isVerified=${user.isVerified}`);
    
    res.json({ 
      success: true,
      message: 'Conta verificada com sucesso!' 
    });
  } catch (error) {
    console.error('[VerifyAccount] Erro crítico:', error);
    
    let errorMessage = 'Erro interno no servidor';
    
    if (error.name === 'SequelizeConnectionError') {
      errorMessage = 'Erro de conexão com a base de dados';
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

exports.firstLogin = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
console.log('[FirstLogin] Verificando token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[FirstLogin] Token válido para utilizador:', decoded.userId);

    console.log('[FirstLogin] Buscando utilizador ID:', decoded.userId);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Utilizador não encontrado' 
      });
    }

    if (user.isVerified && !user.forcePasswordChange) {
      return res.status(403).json({
        success: false,
        error: 'Esta conta já está ativada e não requer mudança de senha'
      });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 8 caracteres'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      password: hashedPassword,
      forcePasswordChange: false,
      isVerified: true,
      lastPasswordChange: new Date(),
      firstLoginToken: null,
      firstLoginTokenExpiry: null
    });

    let roles = [];
    switch (user.primaryRole.toLowerCase()) {
      case 'gestor': 
        roles = ['gestor', 'formador', 'formando'];
        break;
      case 'formador': 
        roles = ['formador', 'formando'];
        break;
      default: 
        roles = ['formando'];
    }

    const authToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        workerNumber: user.workerNumber,
        roles
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        workerNumber: user.workerNumber,
        roles
      }
    });

    await user.update({
      firstLoginToken: null,
      firstLoginTokenExpiry: null
    });
    
  } catch (error) {

    console.error('[FirstLogin] Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    console.error('[FirstLogin] Erro:', error);
    
    let statusCode = 500;
    let errorMessage = 'Erro interno no servidor';
    
    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      errorMessage = 'Token expirado. Solicite novo link.';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      errorMessage = 'Token inválido';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

exports.validateFirstLogin = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token em falta' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado' });
    }
    
    if (user.firstLoginTokenExpiry && new Date() > user.firstLoginTokenExpiry) {
      return res.status(401).json({ success: false, error: 'Token expirado' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('[ValidateFirstLogin] Erro:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expirado' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Token inválido' });
    }
    
    return res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};