import React, { useEffect, useState } from 'react';
import { api } from '../services/authService';
import { Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CoursesCarousel = ({ courses: propCourses }) => {
  const [courses, setCourses] = useState(propCourses || []);
  const [loading, setLoading] = useState(!propCourses);

  useEffect(() => {
    if (!propCourses) {
      const fetchCourses = async () => {
        try {
          const response = await api.get('/cursos/available');
          setCourses(response.data);
        } catch (error) {
          console.error('Erro ao buscar cursos disponíveis:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
    } else {
      setCourses(propCourses);
      setLoading(false);
    }
  }, [propCourses]);

  if (loading) {
    return <div className="text-center my-5"><Spinner animation="border" /></div>;
  }

  return (
    <div className="my-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {courses.map(course => (
          <Col key={course.id}>
            <Card className="h-100 d-flex flex-column">
              <div className="overflow-hidden" style={{ height: '200px' }}>
                <Card.Img
                  variant="top"
                  src={course.image || '/default-course.jpg'}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <Card.Body className="d-flex flex-column flex-grow-1">
                <Card.Title className="h5">{course.title}</Card.Title>
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
                <div className="mt-auto">
                  <Link to={`/cursos/${course.id}`}>
                    <Button variant="primary">Ver Curso</Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CoursesCarousel;