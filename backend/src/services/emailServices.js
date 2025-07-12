require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('[EmailService] Configurando transporte de email...');
console.log(`Usando utilizador: ${process.env.EMAIL_USER}`);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('[EmailService] Erro na configuração do transporte:', error);
  } else {
    console.log('[EmailService] Transporte configurado com sucesso!');
  }
});

exports.sendRegistrationEmail = async (email, userData) => {
  console.log(`[EmailService] Preparando email para: ${email}`);
  
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    console.error('[EmailService] ERRO: FRONTEND_URL não está definida no ambiente!');
    console.error('[EmailService] Por favor, defina FRONTEND_URL no seu .env ou variáveis de ambiente');
  }
  
  const firstLoginLink = frontendUrl 
    ? `${frontendUrl}/first-login?token=${encodeURIComponent(userData.firstLoginToken)}`
    : `https://pint2-1.onrender.com/first-login?token=${encodeURIComponent(userData.firstLoginToken)}`;
  
  console.log('[EmailService] Link gerado:', firstLoginLink);
  
  const mailOptions = {
    from: `Softinsa Formação <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Registo na Plataforma de Formações',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bem-vindo, ${userData.name}!</h2>
        <p>O seu registo na plataforma de formações foi realizado com sucesso.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Os seus dados de acesso:</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Nº Trabalhador:</strong> ${userData.workerNumber}</p>
        </div>
        
        <p>Para ativar a sua conta, por favor clique no link abaixo:</p>
        <a href="${firstLoginLink}" 
            style="display: inline-block; background-color: #2563eb; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                  font-weight: bold; margin: 15px 0;">
          Ativar Conta
        </a>
        <p><strong>Importante:</strong> Este link expira em 2 horas</p>
        
        <p style="font-size: 0.9em; color: #6b7280;">
          Caso não consiga clicar no link, copie e cole esta URL no seu navegador:<br>
          ${firstLoginLink}
        </p>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p>Atenciosamente,<br>Equipa de Formação Softinsa</p>
      </div>
    `
  };

  try {
    console.log('[EmailService] Enviando email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('[EmailService] Email enviado com sucesso! Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('[EmailService] Erro ao enviar email:', error);
    throw error;
  }
};


exports.sendRequestConfirmation = async (requestData) => {
  try {
    const mailOptions = {
      from: `"Softinsa Suporte" <${process.env.EMAIL_USER}>`,
      to: requestData.email,
      subject: `Confirmação de Pedido: ${requestData.subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Pedido</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f7fa;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 10px;
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .card {
              background-color: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
              border-left: 4px solid #2575fc;
            }
            .card h3 {
              color: #2575fc;
              margin-top: 0;
            }
            .info-item {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: 600;
              color: #495057;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6c757d;
              font-size: 14px;
            }
            .logo {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo img {
              max-width: 150px;
            }
            .thank-you {
              text-align: center;
              margin: 25px 0;
              font-size: 18px;
              color: #212529;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              background-color: #e0f7fa;
              color: #006064;
              border-radius: 20px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pedido Recebido</h1>
            </div>
            
            <div class="content">
              <p>Olá ${requestData.name},</p>
              <p>Agradecemos o seu contato. O seu pedido foi registado com sucesso e será analisado pela nossa equipa.</p>
              
              <div class="thank-you">
                <p>Obrigado por entrar em contato com a Softinsa!</p>
              </div>
              
              <div class="card">
                <h3>Detalhes do Pedido</h3>
                <div class="info-item">
                  <span class="info-label">Nº Pedido:</span> #${requestData.id}
                </div>
                <div class="info-item">
                  <span class="info-label">Nº Trabalhador:</span> ${requestData.workerNumber}
                </div>
                <div class="info-item">
                  <span class="info-label">Assunto:</span> ${requestData.subject}
                </div>
                <div class="info-item">
                  <span class="info-label">Data:</span> ${new Date().toLocaleDateString('pt-PT')}
                </div>
                <div class="info-item">
                  <span class="info-label">Status:</span> <span class="status-badge">Pendente</span>
                </div>
              </div>
              
              <div class="card">
                <h3>Sua Mensagem</h3>
                <p>${requestData.message}</p>
              </div>
              
              <p>Entraremos em contato em breve.</p>
              <p>Quaisquer atualizações no pedido, serão enviadas por email</p>
              
              <p>Atenciosamente,<br>Equipa de Suporte Softinsa</p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} SOFTINSA. Todos os direitos reservados.</p>
              <p>Esta é uma mensagem automática, por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de confirmação enviado para o utilizador');
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    throw error;
  }
};

exports.sendRequestResolved = async (requestData) => {
  try {
    const currentYear = new Date().getFullYear();
    const mailOptions = {
      from: `"Softinsa Suporte" <${process.env.EMAIL_USER}>`,
      to: requestData.email,
      subject: `Pedido Resolvido: ${requestData.subject}`,
      html: `
        <!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pedido Resolvido</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #ffffff; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; color: #333; line-height: 1.6; }
            .card { background: #f8f9fa; border-left: 4px solid #2575fc; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
            .card h3 { margin-top: 0; color: #2575fc; }
            .info-item { margin-bottom: 10px; }
            .info-label { font-weight: 600; color: #495057; }
            .status-badge { display: inline-block; padding: 5px 15px; background-color: #e0f7fa; color: #006064; border-radius: 20px; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; border-top: 1px solid #eaeaea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Pedido Resolvido</h1>
            </div>
            <div class="content">
              <p>Olá ${requestData.name},</p>
              <p>O seu pedido <strong>#${requestData.id}</strong> foi resolvido com sucesso. Agradecemos o seu contato e esperamos ter ajudado.</p>
              <div class="card">
                <h3>Detalhes do Pedido</h3>
                <div class="info-item"><span class="info-label">Nº Pedido:</span> #${requestData.id}</div>
                <div class="info-item"><span class="info-label">Nº Trabalhador:</span> ${requestData.workerNumber}</div>
                <div class="info-item"><span class="info-label">Assunto:</span> ${requestData.subject}</div>
                <div class="info-item"><span class="info-label">Status:</span> <span class="status-badge">Resolvido</span></div>
                <div class="info-item"><span class="info-label">Data de Resolução:</span> ${new Date().toLocaleDateString('pt-PT')}</div>
              </div>
              <div class="card">
                <h3>Detalhes da Resolução</h3>
                <p>${requestData.resolutionDetails}</p>
              </div>
              <p>Se tiver mais dúvidas, estamos à disposição.</p>
            </div>
            <div class="footer">
              <p>© ${currentYear} SOFTINSA. Todos os direitos reservados.</p>
              <p>Esta é uma mensagem automática, por favor não responda.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Email de resolução enviado para', requestData.email);
    return true;
  } catch (error) {
    console.error('[EmailService] Erro ao enviar email de resolução:', error);
    throw error;
  }
};

exports.sendPasswordReset = async ({ name, email, resetToken }) => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    console.error('[EmailService] ERRO: FRONTEND_URL não está definida no ambiente!');
    console.error('[EmailService] Por favor, defina FRONTEND_URL no seu .env ou variáveis de ambiente');
  }

  const resetLink = frontendUrl 
    ? `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`
    : `https://pint2-1.onrender.com/reset-password?token=${encodeURIComponent(resetToken)}`;
  
  console.log('[EmailService] Link de reset gerado:', resetLink);
  const currentYear = new Date().getFullYear();

  const mailOptions = {
    from: `"Softinsa Suporte" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Repor Password',
    html: `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Repor Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f7fa;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            color: #fff;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 30px;
          }
          .card {
            background-color: #f8f9fa;
            border-left: 4px solid #2575fc;
            border-radius: 4px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .card h3 {
            margin-top: 0;
            color: #2575fc;
          }
          .info-item {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: 600;
            color: #495057;
          }
          .btn {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #2575fc;
            color: #fff !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #eaeaea;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Repor a Sua Password</h1>
          </div>
          <div class="content">
            <p>Olá ${name},</p>
            <p>Recebemos um pedido para repor a password da sua conta.</p>

            <div class="card">
              <h3>Como Proceder</h3>
              <div class="info-item">
                <span class="info-label">Link de Redefinição:</span><br />
                <a href="${resetLink}" class="btn">Repor Password</a>
              </div>
              <div class="info-item">
                <span class="info-label">Validade:</span> 1 hora
              </div>
            </div>

            <p>Se não pediu esta alteração, basta ignorar este e-mail.</p>
          </div>
          <div class="footer">
            <p>© ${currentYear} SOFTINSA. Todos os direitos reservados.</p>
            <p>Esta é uma mensagem automática, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de redefinição de password enviado para', email);
  } catch (err) {
    console.error('Erro ao enviar email de redefinição de password:', err);
    throw err;
  }
};

exports.sendEnrollmentActivatedEmail = async (email, userName, courseTitle) => {
  const mailOptions = {
    from: `Softinsa Formação <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Inscrição Ativada: ${courseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Olá, ${userName}!</h2>
        <p>A sua inscrição foi <strong>ativada</strong> para o curso <strong>"${courseTitle}"</strong>.</p>
        <p>Já pode aceder ao conteúdo e participar normalmente.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p>Atenciosamente,<br>Equipa de Formação Softinsa</p>
      </div>
    `
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email de ativação de inscrição enviado para ${email}. Message ID:`, info.messageId);
    return true;
  } catch (error) {
    console.error('[EmailService] Erro ao enviar email de ativação de inscrição:', error);
    throw error;
  }
};