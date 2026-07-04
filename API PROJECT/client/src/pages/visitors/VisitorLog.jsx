import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVisitors, fetchMyVisitors, approveVisitor, recordVisitorExit } from '../../redux/slices/visitorSlice';
import { FiSearch, FiCheck, FiX, FiLogOut, FiClock, FiUser } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const VisitorLog = () => {
  const dispatch = useDispatch();
  const { visitors, loading } = useSelector((state) => state.visitors);
  const { user } = useSelector((state) => state.auth);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadVisitors();
  }, [dispatch, dateFilter, statusFilter]);

  const loadVisitors = () => {
    if (user?.role === 'resident') {
      dispatch(fetchMyVisitors());
    } else {
      dispatch(fetchVisitors({ date: dateFilter, status: statusFilter }));
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await dispatch(approveVisitor({ id, status })).unwrap();
      toast.success(`Visitor ${status}`);
    } catch (err) {
      toast.error(err);
    }
  };

  const handleExit = async (id) => {
    try {
      await dispatch(recordVisitorExit(id)).unwrap();
      toast.success('Exit recorded');
    } catch (err) {
      toast.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = { pending: 'status-pending', approved: 'status-approved', rejected: 'status-rejected' };
    return colors[status] || '';
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="visitors-page">
      <div className="page-header">
        <div>
          <h1>{user?.role === 'resident' ? 'My Visitors' : 'Visitor Log'}</h1>
          <p className="page-subtitle">
            {user?.role === 'resident' ? 'Manage visitor approvals' : 'Track all visitor entries and exits'}
          </p>
        </div>
      </div>

      {/* Filters */}
      {user?.role !== 'resident' && (
        <div className="filters-bar">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {/* Visitor Table */}
      {visitors.length > 0 ? (
        <div className="table-container">
          <table className="data-table" id="visitor-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Flat</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((visitor) => (
                <tr key={visitor._id}>
                  <td>
                    <div className="cell-with-icon">
                      <FiUser />
                      <span>{visitor.name}</span>
                    </div>
                  </td>
                  <td>{visitor.phone}</td>
                  <td>
                    <span className={`purpose-badge purpose-${visitor.purpose}`}>
                      {visitor.purpose}
                    </span>
                  </td>
                  <td>{visitor.visitingWing}-{visitor.visitingFlat}</td>
                  <td>{new Date(visitor.entryTime).toLocaleTimeString()}</td>
                  <td>{visitor.exitTime ? new Date(visitor.exitTime).toLocaleTimeString() : '—'}</td>
                  <td>
                    <span className={`status-tag ${getStatusColor(visitor.approvalStatus)}`}>
                      {visitor.approvalStatus}
                    </span>
                  </td>
                  <td>
                    <div className="action-cell">
                      {/* Resident can approve/reject pending visitors */}
                      {user?.role === 'resident' && visitor.approvalStatus === 'pending' && (
                        <>
                          <button
                            className="btn-icon btn-approve"
                            onClick={() => handleApprove(visitor._id, 'approved')}
                            title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button
                            className="btn-icon btn-reject"
                            onClick={() => handleApprove(visitor._id, 'rejected')}
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </>
                      )}
                      {/* Security can record exit */}
                      {(user?.role === 'security' || user?.role === 'admin') &&
                        visitor.approvalStatus === 'approved' &&
                        !visitor.exitTime && (
                          <button
                            className="btn-icon btn-exit"
                            onClick={() => handleExit(visitor._id)}
                            title="Record Exit"
                          >
                            <FiLogOut />
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-box">
          <h3>No Visitors Found</h3>
          <p>No visitor records for the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default VisitorLog;
