import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiHome, FiUserCheck, FiAlertCircle,
  FiDollarSign, FiCalendar, FiTrendingUp
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch all dashboard data in parallel
      const [residentsRes, complaintsRes, billingSummaryRes, visitorsRes] = await Promise.all([
        api.get('/residents').catch(() => ({ data: { residents: [] } })),
        api.get('/complaints').catch(() => ({ data: { complaints: [] } })),
        api.get('/billing/summary').catch(() => ({ data: { summary: {} } })),
        api.get('/visitors?date=' + new Date().toISOString().split('T')[0]).catch(() => ({ data: { visitors: [] } }))
      ]);

      const complaints = complaintsRes.data.complaints || [];
      const summary = billingSummaryRes.data.summary || {};

      setStats({
        totalResidents: residentsRes.data.count || residentsRes.data.residents?.length || 0,
        todayVisitors: visitorsRes.data.count || visitorsRes.data.visitors?.length || 0,
        openComplaints: complaints.filter(c => c.status !== 'closed' && c.status !== 'resolved').length,
        resolvedComplaints: complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length,
        totalComplaints: complaints.length,
        revenue: summary.totalRevenue || 0,
        pendingPayments: summary.totalPending || 0,
        paidBills: summary.paidBills || 0,
        pendingBills: summary.pendingBills || 0,
        overdueBills: summary.overdueBills || 0,
        complaintsByStatus: {
          open: complaints.filter(c => c.status === 'open').length,
          assigned: complaints.filter(c => c.status === 'assigned').length,
          inProgress: complaints.filter(c => c.status === 'in-progress').length,
          resolved: complaints.filter(c => c.status === 'resolved').length,
          closed: complaints.filter(c => c.status === 'closed').length
        }
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const complaintChartData = {
    labels: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
      data: [
        stats?.complaintsByStatus?.open || 0,
        stats?.complaintsByStatus?.assigned || 0,
        stats?.complaintsByStatus?.inProgress || 0,
        stats?.complaintsByStatus?.resolved || 0,
        stats?.complaintsByStatus?.closed || 0
      ],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6b7280'],
      borderWidth: 0
    }]
  };

  const billingChartData = {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [{
      label: 'Bills',
      data: [stats?.paidBills || 0, stats?.pendingBills || 0, stats?.overdueBills || 0],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderRadius: 8
    }]
  };

  return (
    <div className="dashboard-page" id="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}! Here's your society overview.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Link to="/residents" className="stat-card stat-card-blue">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-info">
            <h3>{stats?.totalResidents || 0}</h3>
            <p>Total Residents</p>
          </div>
        </Link>

        <Link to="/visitors" className="stat-card stat-card-green">
          <div className="stat-icon"><FiUserCheck /></div>
          <div className="stat-info">
            <h3>{stats?.todayVisitors || 0}</h3>
            <p>Today's Visitors</p>
          </div>
        </Link>

        <Link to="/complaints" className="stat-card stat-card-orange">
          <div className="stat-icon"><FiAlertCircle /></div>
          <div className="stat-info">
            <h3>{stats?.openComplaints || 0}</h3>
            <p>Open Complaints</p>
          </div>
        </Link>

        <Link to="/billing" className="stat-card stat-card-purple">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-info">
            <h3>₹{(stats?.revenue || 0).toLocaleString()}</h3>
            <p>Revenue Collected</p>
          </div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Complaint Status</h3>
          <div className="chart-container-doughnut">
            <Doughnut
              data={complaintChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Billing Overview</h3>
          <div className="chart-container-bar">
            <Bar
              data={billingChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/residents" className="action-btn">
            <FiUsers /> Manage Residents
          </Link>
          <Link to="/complaints" className="action-btn">
            <FiAlertCircle /> View Complaints
          </Link>
          <Link to="/billing" className="action-btn">
            <FiDollarSign /> Generate Bills
          </Link>
          <Link to="/notices" className="action-btn">
            <FiCalendar /> Post Notice
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
