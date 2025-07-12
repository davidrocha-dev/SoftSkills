const { Request } = require('../models');
const emailService = require('../services/emailServices');

exports.createRequest = async (req, res) => {
  try {
    const { workerNumber, name, email, subject, message } = req.body;
    
    if (!workerNumber || !name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }
    
    const newRequest = await Request.create({
      workerNumber,
      name,
      email,
      subject,
      message,
      status: 'Pendente'
    });
    
    try {
      await emailService.sendRequestConfirmation({
        id: newRequest.id,
        workerNumber,
        name,
        email,
        subject,
        message
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Solicitação enviada com sucesso!',
      requestId: newRequest.id
    });
    
  } catch (error) {
    console.error('Erro ao criar solicitação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
};

exports.resolveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionDetails } = req.body;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação não encontrada'
      });
    }

    await request.update({
      status: 'Resolvido',
      resolutionDetails,
      resolvedAt: new Date()
    });

    try {
      await emailService.sendRequestResolved({
        id: request.id,
        workerNumber: request.workerNumber,
        name: request.name,
        email: request.email,
        subject: request.subject,
        resolutionDetails
      });
      console.log(`Email de resolução enviado para ${request.email}`);
    } catch (emailError) {
      console.error('Erro ao enviar email de resolução:', emailError);
    }

    return res.json({
      success: true,
      message: 'Solicitação marcada como resolvida',
      request
    });
  } catch (error) {
    console.error('Erro ao resolver solicitação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  }
};

exports.listRequests = async (req, res) => {
  try {
    const requests = await Request.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
    
    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro no servidor'
    });
  }
};