import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');
  const { user, api } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await api.get('/enrollments/');
        setEnrollments(response.data.results || []);
        console.log("Enrollments API response:", response.data);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Failed to load your enrolled courses. Please try again later.');
      }
    };

    fetchEnrollments();
  }, [api, location]);

  const calculateProgress = (enrollment) => {
    if (!enrollment.total_lessons) return 0;
    return Math.round((enrollment.completed_lessons / enrollment.total_lessons) * 100);
  };

  const averageProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + calculateProgress(e), 0) / enrollments.length)
    : 0;

  console.log('Enrollments:', enrollments);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1
            className="mb-4 fw-bold"
            style={{
              fontFamily: "Segoe UI, Arial, sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            Welcome back, {user?.first_name || user?.email}!
          </h1>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5
                className="mb-0 fw-semibold"
                style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}
              >
                My Enrolled Courses
              </h5>
              <Link to="/courses" className="btn btn-primary btn-sm">
                Browse All Courses
              </Link>
            </div>
            <div className="card-body">
              {enrollments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">
                    You haven't enrolled in any courses yet.
                  </p>
                  <Link to="/courses" className="btn btn-primary">
                    Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="row">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="col-md-6 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6
                            className="card-title fw-bold"
                            style={{
                              fontFamily: "Segoe UI, Arial, sans-serif",
                            }}
                          >
                            {enrollment.course?.title}
                          </h6>
                          <p
                            className="card-text text-muted small"
                            style={{
                              fontFamily: "Segoe UI, Arial, sans-serif",
                            }}
                          >
                            {enrollment.course?.description?.substring(0, 100)}
                            ...
                          </p>

                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="progress flex-grow-1 me-3"
                              style={{ height: "15px" }}
                            >
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{
                                  width: `${enrollment.progress || 0}%`,
                                }}
                                aria-valuenow={enrollment.progress || 0}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              >
                                {enrollment.progress || 0}%
                              </div>
                            </div>
                            <small className="text-muted">
                            {enrollment.progress || 0}%
                            </small>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              {enrollment.completed_lessons || 0} of{" "}
                              {enrollment.total_lessons || 0} lessons
                            </small>
                            {enrollment.course?.id && (
                              <Link
                                to={`/courses/${enrollment.course.id}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                Continue
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5
                className="mb-0 fw-semibold"
                style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}
              >
                Learning Stats
              </h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-6">
                  <div className="progress-circle mb-2">
                    {enrollments.length}
                  </div>
                  <small className="text-muted">Enrolled Courses</small>
                </div>
                <div className="col-6">
                  <div className="progress-circle mb-2">
                    {
                      enrollments.filter((e) => calculateProgress(e) === 100)
                        .length
                    }
                  </div>
                  <small className="text-muted">Completed</small>
                </div>
              </div>

              <hr />
              <p className="text-center">⭐⭐⭐⭐⭐</p>

 {/*              <div className="text-center">
                <h6
                  style={{
                    fontFamily: "Segoe UI, Arial, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  Overall Progress
                </h6>
                <div className="progress mb-2">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${averageProgress}%` }}
                    aria-valuenow={averageProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {averageProgress}%
                  </div>
                </div>

                <small className="text-muted">
                  {averageProgress}% Average Completion
                </small>
              </div> */}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5
                className="mb-0 fw-semibold"
                style={{ fontFamily: "Segoe UI, Arial, sans-serif" }}
              >
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/courses" className="btn btn-outline-primary">
                  Browse Courses
                </Link>
                <Link to="/profile" className="btn btn-outline-secondary">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 