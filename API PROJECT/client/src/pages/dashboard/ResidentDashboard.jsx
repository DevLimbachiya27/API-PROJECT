import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiAlertCircle, FiCalendar, FiFileText,
  FiUserCheck, FiClock
} from 'react-icons/fi';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const ResidentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResidentData();
  }, []);

  const loadResidentData = async () => {
    try {
      const [billsRes, complaintsRes, noticesRes, visitorsRes, bookingsRes] = await Promise.all([
        api.get('/billing').catch(() => ({ data: { bills: [] } })),
        api.get('/complaints').catch(() => ({ data: { complaints: [] } })),
        api.get('/notices').catch(() => ({ data: { notices: [] } })),
        api.get('/visitors/myvisitors').catch(() => ({ data: { visitors: [] } })),
        api.get('/facilities/bookings').catch(() => ({ data: { bookings: [] } }))
      ]);

      const bills = billsRes.data.bills || [];
      const complaints = complaintsRes.data.complaints || [];

      setData({
        pendingBills: bills.filter(b => b.status !== 'paid'),
        totalDue: bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount + (b.penalty || 0), 0),
        activeComplaints: complaints.filter(c => c.status !== 'closed' && c.status !== 'resolved'),
        recentNotices: (noticesRes.data.notices || []).slice(0, 5),
        pendingVisitors: (visitorsRes.data.visitors || []).filter(v => v.approvalStatus === 'pending'),
        upcomingBookings: (bookingsRes.data.bookings || []).filter(b => b.status === 'approved' && new Date(b.date) >= new Date())
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page" id="resident-dashboard">
      <div className="page-header">
        <div>
          <h1>My Dashboard</h1>
          <p className="page-subtitle">Hello, {user?.name}! Here's what's happening in your society.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Link to="/billing" className="stat-card stat-card-orange">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-info">
            <h3>₹{(data?.totalDue || 0).toLocaleString()}</h3>
            <p>Pending Dues</p>
          </div>
        </Link>

        <Link to="/complaints" className="stat-card stat-card-red">
          <div className="stat-icon"><FiAlertCircle /></div>
          <div className="stat-info">
            <h3>{data?.activeComplaints?.length || 0}</h3>
            <p>Active Complaints</p>
          </div>
        </Link>

        <Link to="/visitors" className="stat-card stat-card-blue">
          <div className="stat-icon"><FiUserCheck /></div>
          <div className="stat-info">
            <h3>{data?.pendingVisitors?.length || 0}</h3>
            <p>Pending Approvals</p>
          </div>
        </Link>

        <Link to="/facilities" className="stat-card stat-card-green">
          <div className="stat-icon"><FiCalendar /></div>
          <div className="stat-info">
            <h3>{data?.upcomingBookings?.length || 0}</h3>
            <p>Upcoming Bookings</p>
          </div>
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* Pending Bills */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FiDollarSign /> Pending Bills</h3>
            <Link to="/billing" className="card-link">View All</Link>
          </div>
          <div className="card-body">
            {data?.pendingBills?.length > 0 ? (
              <ul className="dashboard-list">
                {data.pendingBills.slice(0, 3).map(bill => (
                  <li key={bill._id} className="dashboard-list-item">
                    <div>
                      <strong>₹{bill.amount}</strong>
                      <span className={`status-tag status-${bill.status}`}>{bill.status}</span>
                    </div>
                    <small>Due: {new Date(bill.dueDate).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No pending bills 🎉</p>
            )}
          </div>
        </div>

        {/* Active Complaints */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FiAlertCircle /> Active Complaints</h3>
            <Link to="/complaints" className="card-link">View All</Link>
          </div>
          <div className="card-body">
            {data?.activeComplaints?.length > 0 ? (
              <ul className="dashboard-list">
                {data.activeComplaints.slice(0, 3).map(c => (
                  <li key={c._id} className="dashboard-list-item">
                    <div>
                      <strong>{c.title}</strong>
                      <span className={`status-tag status-${c.status}`}>{c.status}</span>
                    </div>
                    <small>{c.category}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No active complaints</p>
            )}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FiFileText /> Recent Notices</h3>
            <Link to="/notices" className="card-link">View All</Link>
          </div>
          <div className="card-body">
            {data?.recentNotices?.length > 0 ? (
              <ul className="dashboard-list">
                {data.recentNotices.map(notice => (
                  <li key={notice._id} className="dashboard-list-item">
                    <div>
                      <strong>{notice.title}</strong>
                      <span className={`notice-category cat-${notice.category}`}>{notice.category}</span>
                    </div>
                    <small>{new Date(notice.createdAt).toLocaleDateString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No recent notices</p>
            )}
          </div>
        </div>

        {/* Visitor Requests */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3><FiUserCheck /> Visitor Requests</h3>
            <Link to="/visitors" className="card-link">View All</Link>
          </div>
          <div className="card-body">
            {data?.pendingVisitors?.length > 0 ? (
              <ul className="dashboard-list">
                {data.pendingVisitors.slice(0, 3).map(v => (
                  <li key={v._id} className="dashboard-list-item">
                    <div>
                      <strong>{v.name}</strong>
                      <span className="status-tag status-pending">Pending</span>
                    </div>
                    <small>{v.purpose} • {new Date(v.entryTime).toLocaleTimeString()}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No pending visitor requests</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
