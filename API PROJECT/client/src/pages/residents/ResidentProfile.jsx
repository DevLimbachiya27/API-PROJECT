import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyProfile } from '../../redux/slices/residentSlice';
import { FiUser, FiHome, FiPhone, FiMail, FiUsers, FiTruck } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const ResidentProfile = () => {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector((state) => state.residents);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p className="page-subtitle">View and manage your resident profile</p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Personal Info Card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2>{user?.name}</h2>
            <span className={`role-badge badge-${user?.role}`}>{user?.role}</span>
          </div>

          <div className="profile-details">
            <div className="profile-row">
              <FiMail />
              <span>{user?.email}</span>
            </div>
            <div className="profile-row">
              <FiPhone />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            {myProfile && (
              <>
                <div className="profile-row">
                  <FiHome />
                  <span>Flat {myProfile.wing}-{myProfile.flatNumber}, Floor {myProfile.floor}</span>
                </div>
                <div className="profile-row">
                  <FiUser />
                  <span>{myProfile.occupancyType === 'owner' ? 'Owner' : 'Tenant'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Family Members Card */}
        <div className="profile-card">
          <h3><FiUsers /> Family Members</h3>
          {myProfile?.familyMembers?.length > 0 ? (
            <div className="member-list">
              {myProfile.familyMembers.map((member) => (
                <div key={member._id} className="member-item">
                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span className="member-relation">{member.relation}</span>
                  </div>
                  <div className="member-meta">
                    {member.age && <span>Age: {member.age}</span>}
                    {member.phone && <span>{member.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No family members added yet</p>
          )}
        </div>

        {/* Vehicles Card */}
        <div className="profile-card">
          <h3><FiTruck /> Registered Vehicles</h3>
          {myProfile?.vehicles?.length > 0 ? (
            <div className="vehicle-list">
              {myProfile.vehicles.map((vehicle) => (
                <div key={vehicle._id} className="vehicle-item">
                  <div className="vehicle-icon">
                    {vehicle.type === 'car' ? '🚗' : vehicle.type === 'bike' ? '🏍️' : '🛵'}
                  </div>
                  <div className="vehicle-details">
                    <strong>{vehicle.number}</strong>
                    <span>{vehicle.model} {vehicle.color && `(${vehicle.color})`}</span>
                    <span className="vehicle-type">{vehicle.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No vehicles registered</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentProfile;
