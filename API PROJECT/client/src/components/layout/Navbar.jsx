import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { fetchNotifications } from '../../redux/slices/notificationSlice';
import { FiBell, FiUser, FiLogOut, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notifications);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ unread: 'true' }));
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications({ unread: 'true' }));
    }, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'badge-admin',
      resident: 'badge-resident',
      security: 'badge-security',
      maintenance: 'badge-maintenance'
    };
    return classes[role] || 'badge-resident';
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-left">
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          id="sidebar-toggle-btn"
        >
          {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🏘️</span>
          <span className="brand-text">SmartSociety</span>
        </Link>
      </div>

      <div className="navbar-right">
        <Link to="/notifications" className="nav-icon-btn" id="notifications-btn">
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </Link>

        <div className="user-menu" id="user-menu">
          <button
            className="user-menu-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-nav">
              <span className="user-name-nav">{user?.name}</span>
              <span className={`role-badge ${getRoleBadgeClass(user?.role)}`}>
                {user?.role}
              </span>
            </div>
            <FiChevronDown size={16} />
          </button>

          {showDropdown && (
            <div className="dropdown-menu" id="user-dropdown">
              <Link
                to="/profile"
                className="dropdown-item"
                onClick={() => setShowDropdown(false)}
              >
                <FiUser size={16} />
                <span>My Profile</span>
              </Link>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
