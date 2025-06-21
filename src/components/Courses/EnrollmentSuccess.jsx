import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const EnrollmentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseData = location.state?.courseData;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              <FaCheckCircle className="text-success mb-4" style={{ fontSize: '5rem' }} />
              <h2 className="mb-4">Enrollment Successful!</h2>
              <p className="lead mb-4">
                You have successfully enrolled in {courseData?.title || 'the course'}.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/courses/${courseData?.id}`)}
                >
                  Go to Course
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/my-courses')}
                >
                  View My Courses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSuccess; 