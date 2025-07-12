// src/views/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { api } from '../services/authService';
import defaultAvatar from '../assets/img/user-img.png';
import Loading from '../components/Loading';
import { ArrowLeft, ArrowRight } from 'react-bootstrap-icons';

export default function Profile() {
  const { workerNumber } = useParams();
  const { selectedRole, logout } = useAuth();
  const [data, setData] = useState({ user: null, courses: [], certificates: [] });
  const [loading, setLoading] = useState(true);
  const [currentCoursePage, setCurrentCoursePage] = useState(0);
  const COURSES_PER_PAGE = 5;

  useEffect(() => {
    if (!workerNumber || !selectedRole) return;

    setLoading(true);
    const headers = { 'x-selected-role': selectedRole };

    api.get(`/users/id/${workerNumber}`, { headers })
    .then(res => {
      const json = res.data;
      console.log("🔎 Dados recebidos do backend:", json); // <-- adiciona este log
      if (json.success) {
        setData({ user: json.user, courses: json.courses, interests: json.interests, certificates: json.certificates });
      } else {
        console.error('API retornou erro:', json.message);
        setData({ user: null, courses: [], interests: [], certificates: [] });
      }
    })
      .catch(err => {
        console.error('Erro ao buscar perfil:', err);
        setData({ user: null, courses: [], interests: [] });
      })
      .finally(() => setLoading(false));
  }, [workerNumber, selectedRole]);

  if (loading) return <Loading />;

  if (!data.user) {
    return (
      <>
        <Header />
        <div className="container mt-4">
          <p>Utilizador não encontrado.</p>
        </div>
      </>
    );
  }

  const { user, courses, certificates = [] } = data;
  const avatarSrc = user.pfp ? user.pfp : defaultAvatar;

  // Filtrar cursos apenas com inscrição ativa
  const activeCourses = Array.isArray(courses) ? courses.filter(c => c.status === 'Ativo' || c.status === 'ativo') : [];

  return (
    <>
      <Header />
      <div className="container mt-4">
        {/* Top bar: Back to Dashboard and Logout aligned */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/dashboard" className="btn btn-outline-secondary">
            &larr; Voltar ao Dashboard
          </Link>
          <button onClick={logout} className="btn btn-outline-danger">
            Sair
          </button>
        </div>

        {/* User Info */}
        <div className="d-flex align-items-center mb-4">
          <img
            src={avatarSrc}
            alt="Foto de perfil"
            className="rounded-circle me-3"
            style={{ width: 100, height: 100, objectFit: 'cover' }}
          />
          <div>
            <h2 className="mb-1">{user.name}</h2>
            <p className="mb-0">
              <strong>Worker Number:</strong> {user.workerNumber}
            </p>
            <p className="mb-0">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="mb-0">
              <strong>Função:</strong> {user.primaryRole}
            </p>
          </div>
        </div>

        {/* Cursos Inscritos */}
        <div className="mb-4">
          <h4>Cursos Inscritos</h4>
          {activeCourses.length === 0 ? (
            <p>Sem inscrições ativas.</p>
          ) : (
            <>
              <ul className="list-group">
                {activeCourses
                  .slice(currentCoursePage * COURSES_PER_PAGE, (currentCoursePage + 1) * COURSES_PER_PAGE)
                  .map(course => (
                    <li key={course.id} className="list-group-item">
                      <strong>{course.title}</strong>
                    </li>
                  ))}
              </ul>
              {Math.ceil(activeCourses.length / COURSES_PER_PAGE) > 1 && (
                <div className="d-flex justify-content-end align-items-center mt-2">
                  <span
                    role="button"
                    className={`me-3 ${currentCoursePage === 0 ? 'text-secondary' : 'text-primary'}`}
                    style={{ fontSize: '1.5rem', cursor: currentCoursePage === 0 ? 'not-allowed' : 'pointer' }}
                    onClick={() => currentCoursePage > 0 && setCurrentCoursePage(p => Math.max(0, p - 1))}
                    aria-disabled={currentCoursePage === 0}
                  >
                    <ArrowLeft />
                  </span>
                  <span className="mx-2">
                    Página {currentCoursePage + 1} de {Math.ceil(activeCourses.length / COURSES_PER_PAGE)}
                  </span>
                  <span
                    role="button"
                    className={`${currentCoursePage >= Math.ceil(activeCourses.length / COURSES_PER_PAGE) - 1 ? 'text-secondary' : 'text-primary'}`}
                    style={{ fontSize: '1.5rem', cursor: currentCoursePage >= Math.ceil(activeCourses.length / COURSES_PER_PAGE) - 1 ? 'not-allowed' : 'pointer' }}
                    onClick={() => currentCoursePage < Math.ceil(activeCourses.length / COURSES_PER_PAGE) - 1 && setCurrentCoursePage(p => Math.min(Math.ceil(activeCourses.length / COURSES_PER_PAGE) - 1, p + 1))}
                    aria-disabled={currentCoursePage >= Math.ceil(activeCourses.length / COURSES_PER_PAGE) - 1}
                  >
                    <ArrowRight />
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="mb-4">
          <h4>Certificados</h4>
          {certificates.length === 0 ? (
            <p>Sem certificados.</p>
          ) : (
            <ul className="list-group">
              {certificates.map(cert => (
                <li key={cert.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{cert.course.title}</strong> – Nota: {cert.grade}
                  </div>
                  {cert.pdfUrl && (
                    <button
                      className="btn btn-outline-primary btn-sm ms-3"
                      onClick={() => window.open(cert.pdfUrl, '_blank')}
                    >
                      Ver Certificado
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
