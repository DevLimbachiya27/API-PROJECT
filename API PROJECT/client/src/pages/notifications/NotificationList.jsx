import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../redux/slices/notificationSlice';
import { FiCheckCircle, FiCheck, FiBell } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const NotificationList = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications({}));
  }, [dispatch]);

  const handleMarkRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const getTypeIcon = (type) => {
    const icons = {
      'visitor-approval': '👤',
      'complaint-update': '🔧',
      'payment-reminder': '💰',
      'booking-confirmation': '📅',
      'notice': '📌',
      'poll': '📊',
      'general': '🔔'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="notifications-page">
      <div className="page-header">
        <div>
          <h1>Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={handleMarkAllRead}>
            <FiCheckCircle /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'notification-unread' : ''}`}
              onClick={() => !notification.isRead && handleMarkRead(notification._id)}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <span className="notification-time">{getTimeAgo(notification.createdAt)}</span>
              </div>
              {!notification.isRead && (
                <div className="notification-dot"></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-box">
          <FiBell size={48} />
          <h3>All Caught Up!</h3>
          <p>You have no notifications.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationList;
