const express = require('express');
const router = express.Router();
const {
  createResident,
  getAllResidents,
  getResident,
  getMyProfile,
  updateResident,
  addFamilyMember,
  removeFamilyMember,
  addVehicle,
  removeVehicle,
  deactivateResident
} = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Resident's own profile
router.get('/myprofile', getMyProfile);

// Admin routes
router.route('/')
  .get(authorize('admin'), getAllResidents)
  .post(authorize('admin'), createResident);

router.route('/:id')
  .get(getResident)
  .put(authorize('admin'), updateResident);

router.put('/:id/deactivate', authorize('admin'), deactivateResident);

// Family members
router.post('/:id/family', addFamilyMember);
router.delete('/:id/family/:memberId', removeFamilyMember);

// Vehicles
router.post('/:id/vehicles', addVehicle);
router.delete('/:id/vehicles/:vehicleId', removeVehicle);

module.exports = router;
