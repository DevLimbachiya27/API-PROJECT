import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FiMail, FiSend } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgotpassword', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" id="forgot-password-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🔑</span>
          <h1>Forgot Password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reset-email">Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="reset-email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            id="reset-btn"
          >
            {loading ? (
              <span className="btn-loading">Sending...</span>
            ) : (
              <>
                <FiSend /> Send Reset Link
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
