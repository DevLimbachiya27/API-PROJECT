import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, createComplaint, updateComplaintStatus, assignComplaint } from '../../redux/slices/complaintSlice';
import { FiPlus, FiFilter, FiX } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const ComplaintList = () => {
  const dispatch = useDispatch();
  const { complaints, loading } = useSelector((state) => state.complaints);
  const { user } = useSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '', description: '', category: 'electrical', priority: 'medium',
    flatNumber: '', wing: 'A'
  });

  useEffect(() => {
    dispatch(fetchComplaints({ status: statusFilter, category: categoryFilter }));
  }, [dispatch, statusFilter, categoryFilter]);

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newComplaint).forEach(([key, val]) => formData.append(key, val));

    try {
      await dispatch(createComplaint(formData)).unwrap();
      toast.success('Complaint submitted!');
      setShowCreateModal(false);
      setNewComplaint({ title: '', description: '', category: 'electrical', priority: 'medium', flatNumber: '', wing: 'A' });
      dispatch(fetchComplaints({}));
    } catch (err) {
      toast.error(err || 'Failed to submit complaint');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateComplaintStatus({ id, status })).unwrap();
      toast.success(`Complaint marked as ${status}`);
    } catch (err) {
      toast.error(err);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
    return colors[priority] || '#6b7280';
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="complaints-page">
      <div className="page-header">
        <div>
          <h1>Complaints</h1>
          <p className="page-subtitle">
            {user?.role === 'resident' ? 'Track your complaints' :
             user?.role === 'maintenance' ? 'View assigned tasks' : 'Manage all complaints'}
          </p>
        </div>
        {user?.role === 'resident' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="raise-complaint-btn">
            <FiPlus /> Raise Complaint
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select filter-select">
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-select filter-select">
          <option value="">All Categories</option>
          <option value="electrical">Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="water-supply">Water Supply</option>
          <option value="cleaning">Cleaning</option>
          <option value="security">Security</option>
          <option value="parking">Parking</option>
          <option value="lift">Lift</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Complaint Cards */}
      {complaints.length > 0 ? (
        <div className="complaint-grid">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="complaint-card">
              <div className="complaint-card-header">
                <div>
                  <h3>{complaint.title}</h3>
                  <span className="complaint-category">{complaint.category}</span>
                </div>
                <span
                  className="priority-dot"
                  style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                  title={complaint.priority}
                ></span>
              </div>

              <p className="complaint-desc">{complaint.description}</p>

              <div className="complaint-meta">
                {complaint.raisedBy?.name && (
                  <span>By: {complaint.raisedBy.name}</span>
                )}
                {complaint.flatNumber && (
                  <span>Flat: {complaint.wing}-{complaint.flatNumber}</span>
                )}
                <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="complaint-card-footer">
                <span className={`status-tag status-${complaint.status}`}>
                  {complaint.status}
                </span>

                {/* Status update actions */}
                {user?.role === 'maintenance' && complaint.status === 'assigned' && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleStatusUpdate(complaint._id, 'in-progress')}
                  >
                    Start Work
                  </button>
                )}
                {user?.role === 'maintenance' && complaint.status === 'in-progress' && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleStatusUpdate(complaint._id, 'resolved')}
                  >
                    Mark Resolved
                  </button>
                )}
                {user?.role === 'admin' && complaint.status === 'resolved' && (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => handleStatusUpdate(complaint._id, 'closed')}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-box">
          <h3>No Complaints</h3>
          <p>No complaints found for the selected filters.</p>
        </div>
      )}

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Raise a Complaint</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateComplaint}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief description of the issue"
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain the issue in detail..."
                  rows="4"
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                  required
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-select"
                    value={newComplaint.category}
                    onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value})}
                  >
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="water-supply">Water Supply</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="security">Security</option>
                    <option value="parking">Parking</option>
                    <option value="lift">Lift</option>
                    <option value="pest-control">Pest Control</option>
                    <option value="noise">Noise</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-select"
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Wing</label>
                  <select
                    className="form-select"
                    value={newComplaint.wing}
                    onChange={(e) => setNewComplaint({...newComplaint, wing: e.target.value})}
                  >
                    <option value="A">Wing A</option>
                    <option value="B">Wing B</option>
                    <option value="C">Wing C</option>
                    <option value="D">Wing D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Flat Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 101"
                    value={newComplaint.flatNumber}
                    onChange={(e) => setNewComplaint({...newComplaint, flatNumber: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Submit Complaint</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
