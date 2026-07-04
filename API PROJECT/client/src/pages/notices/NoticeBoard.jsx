import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotices, createNotice, deleteNotice } from '../../redux/slices/noticeSlice';
import { FiPlus, FiX, FiTrash2 } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const NoticeBoard = () => {
  const dispatch = useDispatch();
  const { notices, loading } = useSelector((state) => state.notices);
  const { user } = useSelector((state) => state.auth);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [noticeForm, setNoticeForm] = useState({
    title: '', content: '', category: 'notice', priority: 'normal', expiryDate: ''
  });

  useEffect(() => {
    dispatch(fetchNotices({ category: categoryFilter }));
  }, [dispatch, categoryFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createNotice(noticeForm)).unwrap();
      toast.success('Notice published!');
      setShowCreateModal(false);
      setNoticeForm({ title: '', content: '', category: 'notice', priority: 'normal', expiryDate: '' });
    } catch (err) {
      toast.error(err || 'Failed to create notice');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await dispatch(deleteNotice(id)).unwrap();
        toast.success('Notice deleted');
      } catch (err) {
        toast.error(err);
      }
    }
  };

  const getCategoryIcon = (cat) => {
    const icons = { notice: '📌', alert: '🚨', event: '🎉', meeting: '📋', maintenance: '🔧' };
    return icons[cat] || '📌';
  };

  const getPriorityClass = (p) => {
    const classes = { low: 'priority-low', normal: 'priority-normal', high: 'priority-high', urgent: 'priority-urgent' };
    return classes[p] || '';
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="notices-page">
      <div className="page-header">
        <div>
          <h1>Notice Board</h1>
          <p className="page-subtitle">Society announcements and updates</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} id="create-notice-btn">
            <FiPlus /> Post Notice
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="filters-bar">
        <div className="category-pills">
          <button
            className={`pill ${categoryFilter === '' ? 'pill-active' : ''}`}
            onClick={() => setCategoryFilter('')}
          >All</button>
          {['notice', 'alert', 'event', 'meeting', 'maintenance'].map(cat => (
            <button
              key={cat}
              className={`pill ${categoryFilter === cat ? 'pill-active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notice Cards */}
      {notices.length > 0 ? (
        <div className="notice-list">
          {notices.map((notice) => (
            <div key={notice._id} className={`notice-card ${getPriorityClass(notice.priority)}`}>
              <div className="notice-card-header">
                <div className="notice-title-row">
                  <span className="notice-icon">{getCategoryIcon(notice.category)}</span>
                  <h3>{notice.title}</h3>
                </div>
                {user?.role === 'admin' && (
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(notice._id)}>
                    <FiTrash2 />
                  </button>
                )}
              </div>
              <p className="notice-content">{notice.content}</p>
              <div className="notice-footer">
                <span className="notice-author">Posted by {notice.postedBy?.name || 'Admin'}</span>
                <span className="notice-date">{new Date(notice.createdAt).toLocaleDateString()}</span>
                <span className={`notice-category cat-${notice.category}`}>{notice.category}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-box">
          <h3>No Notices</h3>
          <p>No notices found for the selected category.</p>
        </div>
      )}

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post a Notice</h2>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="form-input" placeholder="Notice title"
                  value={noticeForm.title} onChange={(e) => setNoticeForm({...noticeForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea className="form-textarea" rows="5" placeholder="Write the notice content..."
                  value={noticeForm.content} onChange={(e) => setNoticeForm({...noticeForm, content: e.target.value})} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-select" value={noticeForm.category}
                    onChange={(e) => setNoticeForm({...noticeForm, category: e.target.value})}>
                    <option value="notice">Notice</option>
                    <option value="alert">Alert</option>
                    <option value="event">Event</option>
                    <option value="meeting">Meeting</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select className="form-select" value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({...noticeForm, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Expiry Date (Optional)</label>
                <input type="date" className="form-input" value={noticeForm.expiryDate}
                  onChange={(e) => setNoticeForm({...noticeForm, expiryDate: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Publish Notice</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
