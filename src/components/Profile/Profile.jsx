import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const { user, api } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const getUserRole = () => {
    try {
      if (user?.token) {
        const decoded = jwtDecode(user.token);
        return decoded.role || 'student'; // Default to student if role not found
      }
      return 'student';
    } catch (error) {
      console.error('Error decoding token:', error);
      return 'student';
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRole = getUserRole();
        const [userResponse, enrollmentsResponse] = await Promise.all([
          api.get('/profile/'),
          api.get('/enrollments/')
        ]);

        
        // Create a new form data object with all fields
        const newFormData = {
          username: userResponse.data.username || '',
          email: userResponse.data.email || '',
          first_name: userResponse.data.first_name || '',
          last_name: userResponse.data.last_name || ''
        };
        
        console.log('New Form Data:', newFormData);
        setFormData(newFormData);
        setEnrolledCourses(enrollmentsResponse.data.results || []);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [api]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const userRole = getUserRole();
      await api.patch('/profile/', formData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile');
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

  return (
    <div className="row">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title mb-0">Profile Information</h3>
          </div>
          <div className="card-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </div>
{/*               <button type="submit" className="btn btn-primary">
                Update Profile
              </button> */}
            </form>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title mb-0">Enrolled Courses</h3>
          </div>
          <div className="card-body">
            {enrolledCourses.length === 0 ? (
              <p>You haven't enrolled in any courses yet.</p>
            ) : (
              <div className="list-group">
                {enrolledCourses.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="list-group-item"
                  >
                    <h5 className="mb-1">{enrollment.course.title}</h5>
                    <p className="mb-1">{enrollment.course.description}</p>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${enrollment.progress || 0}%` }}
                        aria-valuenow={enrollment.progress || 0}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {enrollment.progress || 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 