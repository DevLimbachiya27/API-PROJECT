import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResidents } from '../../redux/slices/residentSlice';
import { FiSearch, FiPlus, FiPhone, FiMail, FiHome } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const ResidentList = () => {
  const dispatch = useDispatch();
  const { residents, loading } = useSelector((state) => state.residents);
  const [search, setSearch] = useState('');
  const [wingFilter, setWingFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchResidents({ search, wing: wingFilter }));
  }, [dispatch, wingFilter]);

  const handleSearch = () => {
    dispatch(fetchResidents({ search, wing: wingFilter }));
  };

  const filteredResidents = residents.filter(r =>
    r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.flatNumber?.includes(search)
  );

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="residents-page">
      <div className="page-header">
        <div>
          <h1>Residents</h1>
          <p className="page-subtitle">Manage all society residents</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or flat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            id="resident-search"
          />
        </div>
        <select
          value={wingFilter}
          onChange={(e) => setWingFilter(e.target.value)}
          className="form-select filter-select"
        >
          <option value="">All Wings</option>
          <option value="A">Wing A</option>
          <option value="B">Wing B</option>
          <option value="C">Wing C</option>
          <option value="D">Wing D</option>
        </select>
      </div>

      {/* Resident Cards */}
      {filteredResidents.length > 0 ? (
        <div className="card-grid">
          {filteredResidents.map((resident) => (
            <div key={resident._id} className="resident-card">
              <div className="resident-card-header">
                <div className="resident-avatar">
                  {resident.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{resident.user?.name}</h3>
                  <span className={`occupancy-badge ${resident.occupancyType}`}>
                    {resident.occupancyType}
                  </span>
                </div>
              </div>

              <div className="resident-card-details">
                <div className="detail-row">
                  <FiHome />
                  <span>{resident.wing}-{resident.flatNumber}, Floor {resident.floor}</span>
                </div>
                <div className="detail-row">
                  <FiPhone />
                  <span>{resident.user?.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <FiMail />
                  <span>{resident.user?.email}</span>
                </div>
              </div>

              <div className="resident-card-footer">
                <span className="family-count">
                  👨‍👩‍👧‍👦 {resident.familyMembers?.length || 0} members
                </span>
                <span className="vehicle-count">
                  🚗 {resident.vehicles?.length || 0} vehicles
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state-box">
          <h3>No Residents Found</h3>
          <p>No residents match your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ResidentList;
