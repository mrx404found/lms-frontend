import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import PropTypes from 'prop-types';

// Custom hook for course-related API calls
const useCourseApi = (api, courseId) => {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourseDetails = async () => {
    try {
      const courseResponse = await api.get('/courses/');
      const foundCourse = courseResponse.data.results?.find(c => c.id === parseInt(courseId));
      
      if (!foundCourse) {
        throw new Error('Course not found');
      }
      
      console.log('Course data:', foundCourse); // Debug log
      console.log('Instructor data:', foundCourse.instructor); // Debug log
      
      // If instructor is just an ID, create a simple display object
      if (foundCourse.instructor && typeof foundCourse.instructor === 'number') {
        // Map known instructor IDs to their actual names
        const instructorMap = {
          10: { id: 10, first_name: 'Yeo', last_name: 'Mcclure' }
        };
        
        foundCourse.instructor = instructorMap[foundCourse.instructor] || { 
          id: foundCourse.instructor, 
          first_name: `Instructor ${foundCourse.instructor}`, 
          last_name: '' 
        };
        console.log('Created instructor display object:', foundCourse.instructor);
      }
      
      setCourse(foundCourse);
      await checkEnrollmentStatus();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const enrollmentsResponse = await api.get('/enrollments/');
      const enrollment = enrollmentsResponse.data.results.find(e => e.course.id === parseInt(courseId));
      setIsEnrolled(!!enrollment);
      
      if (enrollment) {
        await fetchLessons();
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
      setIsEnrolled(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const lessonsResponse = await api.get('/lessons/', {
        params: { course: courseId }
      });
      setLessons(lessonsResponse.data.results || []);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setLessons([]);
    }
  };

  const handleError = (err) => {
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });

    if (err.message === 'Course not found') {
      setError('Course not found.');
    } else if (err.response?.status === 401) {
      setError('Your session has expired. Please log in again.');
    } else if (err.response?.status === 404) {
      setError('Course not found. Please check the course ID.');
    } else {
      setError('Error fetching course details. Please try again later.');
    }
  };

  return {
    course,
    lessons,
    isEnrolled,
    loading,
    error,
    fetchCourseDetails,
    setLessons,
    setIsEnrolled,
    setError
  };
};

// Course Header Component
const CourseHeader = ({ course, isEnrolled, onEnroll }) => (
  <div className="card mb-4">
    {course.thumbnail && (
      <img
        src={course.thumbnail}
        className="card-img-top"
        alt={course.title}
        style={{ height: '300px', objectFit: 'cover' }}
      />
    )}
    <div className="card-body">
      <h2 className="card-title">{course.title}</h2>
      <p className="card-text">{course.description}</p>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <strong>Instructor:</strong> {
            course.instructor ? 
              (typeof course.instructor === 'number' ? 
                `Instructor ${course.instructor}` : 
                (course.instructor.first_name || course.instructor.name || course.instructor.username || 'Unknown') + 
                ' ' + 
                (course.instructor.last_name || '')
              )
            : 'Not assigned'
          }
        </div>
        <div>
          <strong>Category:</strong> {course.category?.title || 'Uncategorized'}
        </div>
        <div>
          <strong>Duration:</strong> {course.duration} hours
        </div>
        <div>
          <strong>Price:</strong> ${course.price}
        </div>
      </div>
      {!isEnrolled && (
        <div className="mt-3">
          <button className="btn btn-primary" onClick={onEnroll}>
            Enroll in Course
          </button>
        </div>
      )}
    </div>
  </div>
);

CourseHeader.propTypes = {
  course: PropTypes.shape({
    thumbnail: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    instructor: PropTypes.shape({
      first_name: PropTypes.string,
      last_name: PropTypes.string
    }),
    category: PropTypes.shape({
      title: PropTypes.string
    }),
    duration: PropTypes.number,
    price: PropTypes.number
  }).isRequired,
  isEnrolled: PropTypes.bool.isRequired,
  onEnroll: PropTypes.func.isRequired
};

// Lesson List Component
const LessonList = ({ lessons, onLessonComplete, loading }) => (
  <div className="list-group">
    {lessons.length === 0 ? (
      <div className="alert alert-info">
        No lessons available for this course yet.
      </div>
    ) : (
      lessons.map((lesson) => (
        <div key={lesson.id} className="list-group-item list-group-item-action">
          <div className="d-flex w-100 justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{lesson.title}</h5>
              <p className="mb-1">{lesson.description}</p>
              <strong className='mb-1'>Video:</strong>
              {/* Show video */}
              {lesson.video && (
                <div className="mb-2">
                  {lesson.video.includes('youtube.com') || lesson.video.includes('youtu.be') ? (
                    <iframe
                      width="320"
                      height="240"
                      src={getYouTubeEmbedUrl(lesson.video)}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />
                  ) : (
                    <video width="320" height="240" controls>
                      <source src={lesson.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )}
              {/* Show materials */}
              {lesson.materials && lesson.materials.length > 0 && (
                <div className="mt-2">
                  <strong>Materials:</strong>
                  <ul className="list-unstyled ms-3">
                    {lesson.materials.map((material) => (
                      <li key={material.id}>
                        <a
                          href={material.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none"
                        >
                          {material.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div>
              {lesson.completed ? (
                <span className="badge bg-success">Completed</span>
              ) : (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => onLessonComplete(lesson.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    'Mark as Complete'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))
    )}
  </div>
);

LessonList.propTypes = {
  lessons: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      completed: PropTypes.bool,
      materials: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          title: PropTypes.string.isRequired,
          file: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  onLessonComplete: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

function getYouTubeEmbedUrl(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  return url;
}

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useContext(AuthContext);
  const {
    course,
    lessons,
    isEnrolled,
    loading,
    error,
    fetchCourseDetails,
    setLessons,
    setIsEnrolled,
    setError
  } = useCourseApi(api, id);

  useEffect(() => {
    if (user) {
      fetchCourseDetails();
    } else {
      setError('Please log in to view course details');
    }
  }, [id, user]);

  const getUserIdFromToken = () => {
    try {
      if (user?.token) {
        const decoded = jwtDecode(user.token);
        return decoded.user_id;
      }
      return null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      setError('Please log in to enroll in courses');
      return;
    }

    if (!course) {
      setError('Course information not available');
      return;
    }

    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        setError('Unable to get user information. Please log in again.');
        return;
      }

      // First check if already enrolled
      const enrollmentsResponse = await api.get('/enrollments/');
      const existingEnrollment = enrollmentsResponse.data.results.find(
        e => e.course.id === parseInt(id) && e.student.id === parseInt(userId)
      );

      if (existingEnrollment) {
        setError('You are already enrolled in this course');
        return;
      }

      // Create enrollment data with only the required fields
      const enrollmentData = {
        user: parseInt(userId),
        course_id: parseInt(id),
        price: course.price
      };
      console.log('Enrollment data:', enrollmentData);

      // Make the enrollment request
      const response = await api.post('/enrollments/', enrollmentData, {
        headers:{
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.data) {
        setIsEnrolled(true);
        setError('');
        // Navigate to success page with course data
        navigate('/enrollment-success', {
          state: {
            courseData: {
              id: course.id,
              title: course.title,
              instructor: course.instructor
            }
          }
        });
      }
    } catch (err) {
      console.error('Enrollment error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 500) {
        // Try to get more specific error information
        const errorData = err.response?.data;
        let errorMessage = 'Server error occurred while enrolling.';
        
        if (typeof errorData === 'string') {
          // Try to extract error message from HTML response
          const errorMatch = errorData.match(/<pre[^>]*>(.*?)<\/pre>/);
          if (errorMatch) {
            errorMessage = errorMatch[1].trim();
          }
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        }
        
        setError(errorMessage);
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 400) {
        const errorMessage = err.response?.data?.detail || 
                           err.response?.data?.error || 
                           'Invalid enrollment request. Please try again.';
        setError(errorMessage);
      } else if (err.response?.status === 404) {
        setError('Course not found. Please try again.');
      } else {
        setError('Failed to enroll in the course. Please try again later.');
      }
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      setError('');
      setLessons(prevLessons =>
        prevLessons.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, completed: true }
            : lesson
        )
      );

      await api.post(`/lessons/${lessonId}/complete/`);
      const lessonsResponse = await api.get('/lessons/', {
        params: { course: id }
      });
      setLessons(lessonsResponse.data.results || []);
    } catch (err) {
      setError('Error updating lesson status. Please try again.');
      
      setLessons(prevLessons => 
        prevLessons.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, completed: false }
            : lesson
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="alert alert-warning" role="alert">
        Course not found
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <CourseHeader
        course={course}
        isEnrolled={isEnrolled}
        onEnroll={handleEnroll}
      />

      {isEnrolled ? (
        <>
          <h3 className="mb-3">Course Content</h3>
          <LessonList
            lessons={lessons}
            onLessonComplete={handleLessonComplete}
            loading={loading}
          />
        </>
      ) : (
        <div className="alert alert-info">
          Please enroll in this course to access its content.
        </div>
      )}
    </div>
  );
};

export default CourseDetails;