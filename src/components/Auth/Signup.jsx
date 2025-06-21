import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate required fields
    const requiredFields = ['username', 'first_name', 'last_name', 'email', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting form data:', formData); // Debug log
      
      await signup({
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.data) {
        // Handle validation errors
        if (typeof err.response.data === 'object') {
          const errorMessages = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value.join(', ')}`)
            .join('\n');
          setError(errorMessages);
        } else {
          setError(err.response.data.detail || err.response.data);
        }
      } else {
        setError('Error creating account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Sign Up</h2>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username *
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="first_name" className="form-label">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your first name"
                    autoComplete="given-name"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="last_name" className="form-label">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="8"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role *
                </label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing Up...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>
            <div className="text-center mt-3">
              <p>
                Already have an account?{' '}
                <Link to="/login">Login here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 