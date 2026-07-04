import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFacilities, fetchBookings, bookFacility, approveBooking } from '../../redux/slices/facilitySlice';
import { FiCalendar, FiClock, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const FacilityList = () => {
  const dispatch = useDispatch();
  const { facilities, bookings, loading } = useSelector((state) => state.facilities);
  const { user } = useSelector((state) => state.auth);
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [bookForm, setBookForm] = useState({
    date: '', startTime: '09:00', endTime: '11:00', purpose: '', numberOfGuests: 0,
    flatNumber: '', wing: 'A'
  });
  const [activeTab, setActiveTab] = useState('facilities');

  useEffect(() => {
    dispatch(fetchFacilities());
    dispatch(fetchBookings({}));
  }, [dispatch]);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      await dispatch(bookFacility({ ...bookForm, facility: selectedFacility })).unwrap();
      toast.success('Booking request submitted!');
      setShowBookModal(false);
      dispatch(fetchBookings({}));
    } catch (err) {
      toast.error(err || 'Booking failed');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await dispatch(approveBooking({ id, status })).unwrap();
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error(err);
    }
  };

  const openBookModal = (facilityId) => {
    setSelectedFacility(facilityId);
    setShowBookModal(true);
  };

  const facilityIcons = {
    'clubhouse': '🏠', 'gymnasium': '🏋️', 'community-hall': '🏛️',
    'swimming-pool': '🏊', 'sports-court': '🎾', 'garden-area': '🌳',
    'party-lawn': '🎉', 'meeting-room': '📋'
  };

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="facilities-page">
      <div className="page-header">
        <div>
          <h1>Facilities</h1>
          <p className="page-subtitle">Book society facilities and track reservations</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'facilities' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          Available Facilities
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookings' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          {user?.role === 'admin' ? 'All Bookings' : 'My Bookings'}
        </button>
      </div>

      {/* Facilities Grid */}
      {activeTab === 'facilities' && (
        <div className="facility-grid">
          {facilities.map((facility) => (
            <div key={facility.id} className="facility-card">
              <div className="facility-icon">{facilityIcons[facility.id] || '🏢'}</div>
              <h3>{facility.name}</h3>
              <div className="facility-info">
                <span>Capacity: {facility.capacity}</span>
                <span>{facility.ratePerHour > 0 ? `₹${facility.ratePerHour}/hr` : 'Free'}</span>
              </div>
              {user?.role === 'resident' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openBookModal(facility.id)}
                >
                  <FiCalendar /> Book Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="table-container">
          {bookings.length > 0 ? (
            <table className="data-table" id="bookings-table">
              <thead>
                <tr>
                  <th>Facility</th>
                  {user?.role === 'admin' && <th>Booked By</th>}
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  {user?.role === 'admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{facilityIcons[booking.facility] || ''} {booking.facility}</td>
                    {user?.role === 'admin' && <td>{booking.bookedBy?.name || 'N/A'}</td>}
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td>{booking.startTime} - {booking.endTime}</td>
                    <td>{booking.purpose || '—'}</td>
                    <td><span className={`status-tag status-${booking.status}`}>{booking.status}</span></td>
                    {user?.role === 'admin' && (
                      <td>
                        {booking.status === 'pending' && (
                          <div className="action-cell">
                            <button className="btn-icon btn-approve" onClick={() => handleApprove(booking._id, 'approved')}>
                              <FiCheck />
                            </button>
                            <button className="btn-icon btn-reject" onClick={() => handleApprove(booking._id, 'rejected')}>
                              <FiX />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state-box">
              <h3>No Bookings</h3>
              <p>No facility bookings found.</p>
            </div>
          )}
        </div>
      )}

      {/* Book Facility Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book {facilities.find(f => f.id === selectedFacility)?.name}</h2>
              <button className="btn-icon" onClick={() => setShowBookModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleBook}>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" className="form-input" value={bookForm.date}
                  onChange={(e) => setBookForm({...bookForm, date: e.target.value})} required
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input type="time" className="form-input" value={bookForm.startTime}
                    onChange={(e) => setBookForm({...bookForm, startTime: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input type="time" className="form-input" value={bookForm.endTime}
                    onChange={(e) => setBookForm({...bookForm, endTime: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <input type="text" className="form-input" placeholder="e.g. Birthday Party"
                  value={bookForm.purpose} onChange={(e) => setBookForm({...bookForm, purpose: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Wing</label>
                  <select className="form-select" value={bookForm.wing}
                    onChange={(e) => setBookForm({...bookForm, wing: e.target.value})}>
                    <option value="A">Wing A</option>
                    <option value="B">Wing B</option>
                    <option value="C">Wing C</option>
                    <option value="D">Wing D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Flat</label>
                  <input type="text" className="form-input" placeholder="101"
                    value={bookForm.flatNumber} onChange={(e) => setBookForm({...bookForm, flatNumber: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Submit Booking</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityList;
