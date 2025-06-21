import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import CourseList from './components/Courses/CourseList';
import CourseDetails from './components/Courses/CourseDetails';
import Profile from './components/Profile/Profile';
import EnrollmentSuccess from './components/Courses/EnrollmentSuccess';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar />
          <main className="flex-grow-1 container py-4">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Redirect root to dashboard if authenticated, otherwise to login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

              <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
