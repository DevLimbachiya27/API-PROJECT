import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome, FiUsers, FiUserCheck, FiAlertCircle,
  FiDollarSign, FiCalendar, FiFileText, FiBarChart2,
  FiBell, FiCheckSquare
} from 'react-icons/fi';

const Sidebar = ({ isOpen }) => {
  const { user } = useSelector((state) => state.auth);

  // Define nav items based on user role
  const getNavItems = () => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: <FiHome /> }
    ];

    if (user?.role === 'admin') {
      return [
        ...common,
        { path: '/residents', label: 'Residents', icon: <FiUsers /> },
        { path: '/visitors', label: 'Visitors', icon: <FiUserCheck /> },
        { path: '/complaints', label: 'Complaints', icon: <FiAlertCircle /> },
        { path: '/billing', label: 'Billing', icon: <FiDollarSign /> },
        { path: '/facilities', label: 'Facilities', icon: <FiCalendar /> },
        { path: '/notices', label: 'Notices', icon: <FiFileText /> },
        { path: '/polls', label: 'Polls', icon: <FiBarChart2 /> },
        { path: '/notifications', label: 'Notifications', icon: <FiBell /> }
      ];
    }

    if (user?.role === 'resident') {
      return [
        ...common,
        { path: '/profile', label: 'My Profile', icon: <FiUsers /> },
        { path: '/visitors', label: 'My Visitors', icon: <FiUserCheck /> },
        { path: '/complaints', label: 'Complaints', icon: <FiAlertCircle /> },
        { path: '/billing', label: 'My Bills', icon: <FiDollarSign /> },
        { path: '/facilities', label: 'Book Facility', icon: <FiCalendar /> },
        { path: '/notices', label: 'Notices', icon: <FiFileText /> },
        { path: '/polls', label: 'Polls', icon: <FiBarChart2 /> },
        { path: '/notifications', label: 'Notifications', icon: <FiBell /> }
      ];
    }

    if (user?.role === 'security') {
      return [
        ...common,
        { path: '/visitors', label: 'Visitor Log', icon: <FiUserCheck /> },
        { path: '/visitors/register', label: 'Register Visitor', icon: <FiUsers /> },
        { path: '/notifications', label: 'Notifications', icon: <FiBell /> }
      ];
    }

    if (user?.role === 'maintenance') {
      return [
        ...common,
        { path: '/complaints', label: 'Assigned Tasks', icon: <FiCheckSquare /> },
        { path: '/notifications', label: 'Notifications', icon: <FiBell /> }
      ];
    }

    return common;
  };

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`} id="main-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-details">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {getNavItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>© 2025 SmartSociety</p>
      </div>
    </aside>
  );
};

export default Sidebar;
