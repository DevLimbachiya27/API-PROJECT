import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'resident'
  });
  const [formError, setFormError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const { confirmPassword, ...submitData } = formData;
    dispatch(registerUser(submitData));
  };

  return (
    <div className="auth-container" id="register-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo">🏘️</span>
          <h1>Create Account</h1>
          <p>Join the Smart Society community</p>
        </div>

        {(error || formError) && (
          <div className="alert alert-error">{error || formError}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="resident">Resident</option>
                <option value="security">Security Staff</option>
                <option value="maintenance">Maintenance Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="register-btn"
          >
            {loading ? (
              <span className="btn-loading">Creating account...</span>
            ) : (
              <>
                <FiUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
