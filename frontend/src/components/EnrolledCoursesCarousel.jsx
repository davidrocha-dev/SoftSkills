import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { api } from '../services/authService';
import { Card, Button, Spinner, Badge } from 'react-bootstrap';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useAuth } from '../context/AuthContext';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Loading from './Loading';

// Componente genérico de seta com cor azul personalizada
const Arrow = ({ onClick, direction }) => {
  const isPrev = direction === 'prev';
  return (
    <button
      onClick={onClick}
      aria-label={isPrev ? 'Anterior' : 'Próximo'}
      style={{
        position: 'absolute',
        top: '50%',
        [isPrev ? 'left' : 'right']: '-30px',
        transform: 'translateY(-50%)',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 2,
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0056b3'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#007bff'}
    >
      {isPrev ? <AiOutlineLeft size={24} color="#ffffff" /> : <AiOutlineRight size={24} color="#ffffff" />}
    </button>
  );
};

const EnrolledCoursesCarousel = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user?.id) {
        console.error('ID do usuário não disponível');
        setLoading(false);
        return;
      }

      if (isNaN(user.id)) {
        console.error('ID do usuário inválido:', user.id);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await api.get(`/cursos/enrolled/${user.id}`);
        setCourses(data);
      } catch (error) {
        console.error('Erro ao buscar cursos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: <Arrow direction="prev" />,
    nextArrow: <Arrow direction="next" />,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } }
    ]
  };

  if (loading) {
    return <Loading />;
  }

  if (courses.length === 0) {
    return (
      <div className="my-5">
        <p>Você ainda não está inscrito em nenhum curso.</p>
      </div>
    );
  }

  return (
    <div className="my-5 position-relative">
      <Slider {...settings}>
        {courses.map(course => (
          <div key={course.id} className="px-2">
            <Card className="h-100 d-flex flex-column">
              <div className="overflow-hidden" style={{ height: '200px' }}>
                <Card.Img
                  variant="top"
                  src={course.image || '/default-course.jpg'}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <Card.Body className="d-flex flex-column flex-grow-1">
                <Card.Title className="h5">
                  {course.title}
                </Card.Title>
                <div className="mb-2">
                  <span className={`badge rounded-pill ${course.courseType ? 'bg-info' : 'bg-secondary'}`}>{course.courseType ? 'Síncrono' : 'Assíncrono'}</span>
                </div>
                <Card.Text
                  className="flex-grow-1 mb-3 text-wrap"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '96px'
                  }}
                >
                  {course.description}
                </Card.Text>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Link to={`/cursos/${course.id}`}>
                    <Button variant="success">Ver Curso</Button>
                  </Link>
                  <div>
                    {course.enrollmentStatus === 'Ativo' && (
                      <Badge bg="success">Inscrito</Badge>
                    )}
                    {course.enrollmentStatus === 'Pendente' && (
                      <Badge bg="warning" text="dark">Pendente</Badge>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default EnrolledCoursesCarousel;