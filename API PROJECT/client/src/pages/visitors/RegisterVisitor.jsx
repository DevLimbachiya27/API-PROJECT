import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerVisitor } from '../../redux/slices/visitorSlice';
import { FiUser, FiPhone, FiHome, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RegisterVisitor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    purpose: 'guest',
    visitingFlat: '',
    visitingWing: 'A',
    vehicleNumber: '',
    numberOfVisitors: 1,
    remarks: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerVisitor(formData)).unwrap();
      toast.success('Visitor registered successfully!');
      navigate('/visitors');
    } catch (err) {
      toast.error(err || 'Failed to register visitor');
    }
  };

  return (
    <div className="page-container" id="register-visitor-page">
      <div className="page-header">
        <div>
          <h1>Register Visitor</h1>
          <p className="page-subtitle">Register a new visitor at the gate</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="form-layout">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="visitor-name">Visitor Name *</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="visitor-name"
                  name="name"
                  placeholder="Enter visitor's name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="visitor-phone">Phone Number *</label>
              <div className="input-with-icon">
                <FiPhone className="input-icon" />
                <input
                  type="tel"
                  id="visitor-phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="visitor-purpose">Purpose *</label>
              <select
                id="visitor-purpose"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="form-select"
              >
                <option value="guest">Guest</option>
                <option value="delivery">Delivery</option>
                <option value="service">Service</option>
                <option value="cab">Cab/Taxi</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="visitor-count">Number of Visitors</label>
              <input
                type="number"
                id="visitor-count"
                name="numberOfVisitors"
                min="1"
                max="20"
                value={formData.numberOfVisitors}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="visiting-wing">Wing *</label>
              <select
                id="visiting-wing"
                name="visitingWing"
                value={formData.visitingWing}
                onChange={handleChange}
                className="form-select"
              >
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
                <option value="C">Wing C</option>
                <option value="D">Wing D</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="visiting-flat">Flat Number *</label>
              <div className="input-with-icon">
                <FiHome className="input-icon" />
                <input
                  type="text"
                  id="visiting-flat"
                  name="visitingFlat"
                  placeholder="e.g. 101"
                  value={formData.visitingFlat}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehicle-no">Vehicle Number</label>
              <input
                type="text"
                id="vehicle-no"
                name="vehicleNumber"
                placeholder="e.g. MH01AB1234"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="visitor-remarks">Remarks</label>
              <input
                type="text"
                id="visitor-remarks"
                name="remarks"
                placeholder="Any additional notes"
                value={formData.remarks}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="submit-visitor-btn">
            <FiSend /> Register Visitor
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterVisitor;
