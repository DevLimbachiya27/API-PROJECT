import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ResidentDashboard from './pages/dashboard/ResidentDashboard';

// Module Pages
import ResidentList from './pages/residents/ResidentList';
import ResidentProfile from './pages/residents/ResidentProfile';
import VisitorLog from './pages/visitors/VisitorLog';
import RegisterVisitor from './pages/visitors/RegisterVisitor';
import ComplaintList from './pages/complaints/ComplaintList';
import BillList from './pages/billing/BillList';
import FacilityList from './pages/facilities/FacilityList';
import NoticeBoard from './pages/notices/NoticeBoard';
import PollList from './pages/polls/PollList';
import NotificationList from './pages/notifications/NotificationList';

// Common
import PrivateRoute from './components/common/PrivateRoute';

// Dashboard router - shows correct dashboard based on role
const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (user?.role === 'admin') return <AdminDashboard />;
  return <ResidentDashboard />;
};

// Main layout with sidebar
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <div className="app-body">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? '' : 'main-expanded'}`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        theme="colored"
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <AppLayout><DashboardRouter /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/residents" element={
          <PrivateRoute roles={['admin']}>
            <AppLayout><ResidentList /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute roles={['resident']}>
            <AppLayout><ResidentProfile /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/visitors" element={
          <PrivateRoute roles={['admin', 'security', 'resident']}>
            <AppLayout><VisitorLog /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/visitors/register" element={
          <PrivateRoute roles={['security', 'admin']}>
            <AppLayout><RegisterVisitor /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/complaints" element={
          <PrivateRoute>
            <AppLayout><ComplaintList /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/billing" element={
          <PrivateRoute roles={['admin', 'resident']}>
            <AppLayout><BillList /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/facilities" element={
          <PrivateRoute roles={['admin', 'resident']}>
            <AppLayout><FacilityList /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/notices" element={
          <PrivateRoute>
            <AppLayout><NoticeBoard /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/polls" element={
          <PrivateRoute roles={['admin', 'resident']}>
            <AppLayout><PollList /></AppLayout>
          </PrivateRoute>
        } />

        <Route path="/notifications" element={
          <PrivateRoute>
            <AppLayout><NotificationList /></AppLayout>
          </PrivateRoute>
        } />

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
