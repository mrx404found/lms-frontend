import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { api } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/courses/');
        console.log('Courses response:', response.data); // Debug log
        setCourses(response.data.results || []); // Access the results array
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [api]);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h1>Available Courses</h1>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No courses available at the moment.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {courses.map((course) => (
            <div key={course.id} className="col">
              <div className="card h-100">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    className="card-img-top"
                    alt={course.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{course.title}</h5>
                  <p className="card-text text-muted">
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 ? '...' : ''}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {course.total_lessons || 0} lessons
                    </small>
                    <Link to={`/courses/${course.id}`} className="btn btn-primary">
                      View Course
                    </Link>
                  </div>
                </div>
                {course.instructor && (
                  <div className="card-footer bg-transparent">
                    <small className="text-muted">
                      Instructor: {course.instructor.first_name} {course.instructor.last_name}
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList; 