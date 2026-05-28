const router = require('express').Router();
const { authorize } = require('../middleware/roles');
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientsController');

// GET - superadmin, admin, staff can see all patients
// the doctors will see only their patients (logic in controller)
router.get('/', getAllPatients);
router.get('/:id', getPatientById);

// POST, PUT, DELETE - only superadmin, admin and staff
router.post('/', authorize('superadmin', 'admin', 'staff'), createPatient);
router.put('/:id', authorize('superadmin', 'admin', 'staff'), updatePatient);
router.delete('/:id', authorize('superadmin', 'admin', 'staff'), deletePatient);

module.exports = router;