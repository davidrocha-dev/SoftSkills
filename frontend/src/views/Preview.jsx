import React from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaCertificate, 
  FaComments, 
  FaChartLine,
  FaShieldAlt,
  FaClock,
  FaDatabase,
  FaCode,
  FaRocket,
  FaEnvelope,
  FaFileAlt,
  FaUserGraduate,
  FaUserTie,
  FaUserCog,
  FaAndroid
} from 'react-icons/fa';
import Header from '../components/Header';
import '../assets/styles/preview.css';

const Preview = () => {
  const features = [
    {
      icon: <FaGraduationCap className="feature-icon" />,
      title: "Gestão de Cursos",
      description: "Suporte a cursos síncronos e assíncronos com estrutura hierárquica completa (Áreas → Categorias → Tópicos → Cursos)",
      details: ["Cursos presenciais/virtuais", "Cursos online 24/7", "Gestão de conteúdo", "Controlo de vagas"]
    },
    {
      icon: <FaUsers className="feature-icon" />,
      title: "Sistema de Utilizadores",
      description: "Gestão hierárquica de utilizadores com três níveis de acesso e permissões específicas",
      details: ["Gestor (acesso total)", "Formador (gestão de cursos)", "Formando (acesso aos cursos)"]
    },
    {
      icon: <FaCertificate className="feature-icon" />,
      title: "Certificados Automáticos",
      description: "Geração automática de certificados PDF com validação de nota mínima e armazenamento seguro",
      details: ["PDFKit para geração", "Upload para Cloudinary", "Validação de nota mínima", "Download seguro"]
    },
    {
      icon: <FaComments className="feature-icon" />,
      title: "Fórum de Discussão",
      description: "Sistema completo de comunicação com moderação e sistema de denúncias",
      details: ["Criação de tópicos", "Sistema de comentários", "Moderação por gestores", "Sistema de denúncias"]
    },
    {
      icon: <FaChartLine className="feature-icon" />,
      title: "Dashboard e Relatórios",
      description: "Dashboards personalizados por tipo de utilizador com estatísticas e métricas",
      details: ["Estatísticas de participação", "Interface responsiva", "Métricas em tempo real"]
    },
    {
      icon: <FaEnvelope className="feature-icon" />,
      title: "Sistema de Suporte",
      description: "Gestão completa de pedidos e suporte com notificações automáticas por email",
      details: ["Formulário de contacto", "Gestão de pedidos", "Notificações automáticas", "Tracking de status"]
    }
  ];

  const technicalFeatures = [
    {
      icon: <FaShieldAlt className="tech-icon" />,
      title: "Segurança",
      items: ["JWT Authentication", "bcrypt Password Hashing", "Role-based Authorization", "CORS Protection"]
    },
    {
      icon: <FaDatabase className="tech-icon" />,
      title: "Base de Dados",
      items: ["PostgreSQL", "Sequelize ORM", "Relacionamentos Complexos", "Validação de Dados"]
    },
    {
      icon: <FaCode className="tech-icon" />,
      title: "Backend",
      items: ["Node.js", "Express.js", "RESTful APIs", "Middleware Customizado"]
    },
    {
      icon: <FaRocket className="tech-icon" />,
      title: "Frontend",
      items: ["React 19", "Vite", "Bootstrap 5", "Componentes Reutilizáveis"]
    },
    {
      icon: <FaClock className="tech-icon" />,
      title: "Automação",
      items: ["Node-cron Jobs", "Atualização Automática de Status", "Geração Automática de Certificados", "Notificações por Email"]
    },
    {
      icon: <FaFileAlt className="tech-icon" />,
      title: "Upload & Storage",
      items: ["Multer", "Cloudinary", "PDFKit", "Gestão de Ficheiros"]
    }
  ];

  const userRoles = [
    {
      icon: <FaUserCog className="role-icon" />,
      title: "Gestor",
      color: "primary",
      permissions: [
        "Gestão completa de utilizadores",
        "Criação e gestão de cursos",
        "Emissão de certificados",
        "Moderação do fórum",
        "Gestão de pedidos de suporte",
        "Acesso a todos os relatórios"
      ]
    },
    {
      icon: <FaUserTie className="role-icon" />,
      title: "Formador",
      color: "success",
      permissions: [
        "Gestão dos seus cursos",
        "Avaliação de formandos",
        "Participação no fórum",
        "Visualização de relatórios dos seus cursos",
        "Upload de materiais"
      ]
    },
    {
      icon: <FaUserGraduate className="role-icon" />,
      title: "Formando",
      color: "info",
      permissions: [
        "Inscrição em cursos",
        "Acesso ao conteúdo dos cursos",
        "Participação no fórum",
        "Visualização de certificados",
        "Acesso ao perfil pessoal"
      ]
    }
  ];

  return (
    <>
      <Header />
      <div className="preview-container"> 
        <section className="hero-section">
          <Container>
            <Row className="align-items-center min-vh-100">
              <Col lg={6}>
                <h1 className="hero-title">
                  Plataforma de Formação - Softinsa
                </h1>
                <p className="hero-subtitle">
                  Uma solução completa para gestão de formação corporativa, 
                  desenvolvida para maximizar a eficiência e qualidade do 
                  processo de aprendizagem.
                </p>
              </Col>
              <Col lg={6} className="text-center">
                <div className="hero-image">
                  <img 
                    src="https://res.cloudinary.com/dnhahua4h/image/upload/v1752291012/brave_0Kffl4tU92_hcgczp.png" 
                    alt="Softinsa Platform" 
                    className="hero-main-image" 
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        <div className="hero-buttons-centered d-flex flex-column align-items-center my-5">
          <Link to="/login" className="btn btn-primary hero-btn mb-3 d-flex align-items-center justify-content-center" style={{ fontWeight: 600, fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: 50, minWidth: 220 }}>
            Aceder à Plataforma
          </Link>
          <a href="https://drive.google.com/file/d/13NcgKF52g1y5CkmrgXy_Alq4JtfNdx_v/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn btn-outline-secondary hero-btn d-flex align-items-center justify-content-center" style={{ fontWeight: 600, fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: 50, minWidth: 220 }}>
            <FaAndroid className="android-icon me-2" />
            <span className="d-flex flex-column align-items-center w-100">
              <span>Descarregar</span>
              <span style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1 }}>Android</span>
            </span>
          </a>
        </div>

        <section className="features-section py-5">
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="section-title">Funcionalidades Principais</h2>
                <p className="section-subtitle">
                  Descubra as principais funcionalidades que tornam a Softinsa Formação 
                  uma solução completa para formação corporativa
                </p>
              </Col>
            </Row>
            <Row>
              {features.map((feature, index) => (
                <Col lg={4} md={6} className="mb-4" key={index}>
                  <Card className="feature-card h-100">
                    <Card.Body className="text-center">
                      <div className="feature-icon-wrapper">
                        {feature.icon}
                      </div>
                      <Card.Title className="mt-3">{feature.title}</Card.Title>
                      <Card.Text className="text-muted">
                        {feature.description}
                      </Card.Text>
                      <ul className="feature-list">
                        {feature.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className="tech-section py-5 bg-light">
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="section-title">Stack Tecnológico</h2>
                <p className="section-subtitle">
                  Tecnologias modernas e robustas para garantir performance, 
                  segurança e escalabilidade
                </p>
              </Col>
            </Row>
            <Row>
              {technicalFeatures.map((tech, index) => (
                <Col lg={4} md={6} className="mb-4" key={index}>
                  <Card className="tech-card h-100">
                    <Card.Body className="text-center">
                      <div className="tech-icon-wrapper">
                        {tech.icon}
                      </div>
                      <Card.Title className="mt-3">{tech.title}</Card.Title>
                      <ul className="tech-list">
                        {tech.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className="roles-section py-5">
          <Container>
            <Row className="text-center mb-5">
              <Col>
                <h2 className="section-title">Sistema de Utilizadores</h2>
                <p className="section-subtitle">
                  Hierarquia de utilizadores com permissões específicas 
                  para cada tipo de utilizador
                </p>
              </Col>
            </Row>
            <Row>
              {userRoles.map((role, index) => (
                <Col lg={4} className="mb-4" key={index}>
                  <Card className={`role-card h-100 border-${role.color}`}>
                    <Card.Body className="text-center">
                      <div className={`role-icon-wrapper bg-${role.color}`}>
                        {role.icon}
                      </div>
                      <Card.Title className="mt-3">{role.title}</Card.Title>
                      <ul className="role-list">
                        {role.permissions.map((permission, idx) => (
                          <li key={idx}>{permission}</li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        <section className="cta-section py-5 bg-primary text-white">
          <Container>
            <Row className="text-center">
              <Col>
                <h2 className="cta-title">Pronto para começar?</h2>
                <p className="cta-subtitle">
                  Experimente a plataforma Softinsa Formação e descubra como pode 
                  revolucionar a gestão de formação na sua organização
                </p>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-2">
              <Link to="/login" className="btn btn-light cta-button" style={{ fontWeight: 600, fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: 50, minWidth: 220 }}>
                Aceder à Plataforma
              </Link>
            </div>
          </Container>
        </section>
              
        <footer className="footer py-4 bg-dark text-white">
          <Container>
            <Row className="text-center">
              <Col>
                <p className="mb-0">
                  © 2025 Plataforma de Formação Softinsa.
                  Todos os direitos reservados.
                </p>
              </Col>
            </Row>
          </Container>
        </footer>
      </div>
    </>
  );
};

export default Preview; 