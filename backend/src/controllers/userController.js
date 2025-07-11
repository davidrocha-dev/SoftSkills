require ('dotenv').config();
const { User, Enrollment, Interest, Course, Request, Certificate} = require('../models');
const bcrypt = require('bcrypt');
const emailService = require('../services/emailServices');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

exports.getProfile = async (req, res) => {
  try {

    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'workerNumber', 'name', 'email', 'primaryRole'] 
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }
    
    res.json({ success: true, user });
    
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor' 
    });
  }
};

exports.getProfileByWorkerNumber = async (req, res) => {
  try {
    const { workerNumber } = req.params;

    const user = await User.findOne({
      where: { workerNumber },
      attributes: ['id', 'workerNumber', 'name', 'email', 'primaryRole', 'pfp']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilizador não encontrado'
      });
    }

    const enrollments = await Enrollment.findAll({
      where: { userId: user.id },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'horas',  'description', 'startDate', 'endDate']
      }]
    });

    const courses = enrollments.map(e => {
      return e.course;
    });


    const certificates = await Certificate.findAll({
      where: { workerNumber: user.workerNumber },
      include: [{
        model: Course,
        as: 'course',
        attributes: ['id', 'title', 'horas',  'description', 'startDate', 'endDate']
      }]
    });

    return res.json({
      success: true,
      user,
      courses,
      certificates
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno no servidor',
      details: error.message
    });
  }
};


  exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'workerNumber', 'name', 'email', 'primaryRole', 'status', 'createdAt'],
      order: [['id', 'ASC']]
    });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Erro ao listar todos os utilizadores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {

    const { id } = req.params;
    // Impedir autoeliminação
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Não é possível eliminar o utilizador autenticado.'
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }


    // Eliminar todas as inscrições associadas ao utilizador (não bloquear se existirem)

    // 1) Apagar inscrições associadas ao utilizador
    await Enrollment.destroy({ where: { userId: id } });


    // 2) Apagar pedidos de suporte associados ao utilizador
    await Request.destroy({ where: { workerNumber: user.workerNumber } });

    // 3) Apagar interesses associados ao utilizador
    await Interest.destroy({ where: { workerNumber: user.workerNumber } });

    // 4) Apagar certificados associados ao utilizador
    const { Certificate, Notification, Reaction, Comment, Report } = require('../models');
    await Certificate.destroy({ where: { workerNumber: user.workerNumber } });

    // 5) Apagar notificações associadas ao utilizador (workerNumber)
    await Notification.destroy({ where: { workerNumber: user.workerNumber } });

    // 6) Apagar reações associadas ao utilizador
    await Reaction.destroy({ where: { userId: id } });

    // 7) Apagar comentários associados ao utilizador
    await Comment.destroy({ where: { userId: id } });

    // 8) Apagar relatórios feitos pelo utilizador
    await Report.destroy({ where: { userId: id } });

    // 9) Limpar o campo formador nos cursos onde o utilizador era instrutor
    await Course.update(
      { instructor: '' },
      { where: { instructor: user.name } }
    );

    // 9) Finalmente elimina o utilizador
    await user.destroy();
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao eliminar utilizador:', error);
    // captura erro de FK caso haja outra relação que não contámos
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível eliminar utilizador ligado a outros registos'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao eliminar utilizador'
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, workerNumber, role } = req.body;


    if (!name || !name.trim()) return res.status(400).json({ error: 'Campo "name" obrigatório' });
    if (!workerNumber || !workerNumber.trim()) return res.status(400).json({ error: 'Campo "workerNumber" obrigatório' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Campo "email" obrigatório' });
    if (!role || !role.trim()) return res.status(400).json({ error: 'Campo "role" obrigatório' });


    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Criar o usuário
    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      workerNumber: workerNumber.trim(),
      password: hashedPassword,
      primaryRole: role.trim(),
      forcePasswordChange: true,
      isVerified: false,
      status: true,
      createdAt: new Date()
    });

    // Gerar token first login
    const firstLoginToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    const expiry = new Date(Date.now() + 2 * 3600 * 1000); // 1h
    user.firstLoginToken = firstLoginToken;
    user.firstLoginTokenExpiry = expiry;
    await user.save();

    // Guardar token e expiry no utilizador
    user.firstLoginToken = firstLoginToken;
    user.firstLoginTokenExpiry = expiry;
    await user.save();

    // Enviar email com o token
    try {
      await emailService.sendRegistrationEmail(email, {
        name,
        workerNumber,
        tempPassword,
        firstLoginToken
      });
    } catch (emailError) {
      console.error('[UserController] Falha ao enviar email:', emailError);
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      userId: user.id,
      emailSent: true
    });
  } catch (error) {
    console.error('Erro detalhado ao criar utilizador:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        campo: err.path,
        mensagem: err.message,
        valor: err.value
      }));
      return res.status(400).json({
        error: 'Erro de validação',
        details: errors
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Violação de unicidade',
        details: error.errors.map(e => ({
          campo: e.path,
          mensagem: e.message
        }))
      });
    }

    res.status(500).json({
      error: 'Erro interno no servidor',
      details: error.message
    });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success:false, error:'Utilizador não encontrado' });

    // gerar token
    const rawToken = `${user.id}-${Date.now()}`;
    const resetToken = await bcrypt.hash(rawToken, 10);
    const expiry = new Date(Date.now() + 3600 * 1000); // 1h

    // guardar no utilizador
    user.resetToken = resetToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    // enviar email
    await emailService.sendPasswordReset({
      name: user.name,
      email: user.email,
      resetToken
    });

    return res.json({ success:true, message:'Email de redefinição enviado' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, error:'Erro interno no servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success:false, error:'Token e nova password são obrigatórios' });
    }

    // procurar utilizador com token válido e não expirado
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ success:false, error:'Token inválido ou expirado' });
    }

    // atualizar password
    user.password = await bcrypt.hash(newPassword, 10);
    // limpar token
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({ success:true, message:'Password atualizada com sucesso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, error:'Erro interno no servidor' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, pfp } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado' });
    }

    // Atualiza campos permitidos
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (pfp !== undefined) user.pfp = pfp;

    await user.save();
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    return res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'name', 'email', 'workerNumber', 'pfp']
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    console.error('Erro ao obter utilizador:', error);
    return res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token em falta' });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Token inválido ou expirado' });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Erro em validateResetToken:', err);
    return res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};

exports.requestPasswordResetByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email é obrigatório' });
    }

    // 1) Encontrar utilizador pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilizador não encontrado' });
    }

    // 2) Gerar token e expiry
    const rawToken = `${user.id}-${Date.now()}`;
    const resetToken = await bcrypt.hash(rawToken, 10);
    const expiry     = new Date(Date.now() + 3600 * 1000);

    // 3) Guardar no utilizador
    user.resetToken        = resetToken;
    user.resetTokenExpiry = expiry;
    await user.save();

    // 4) Enviar e-mail
    await emailService.sendPasswordReset({
      name:  user.name,
      email: user.email,
      resetToken
    });

    return res.json({ success: true, message: 'Email de redefinição enviado' });

  } catch (err) {
    return res.status(500).json({ success: false, error: 'Erro interno no servidor', details: err.message });
  }
};
