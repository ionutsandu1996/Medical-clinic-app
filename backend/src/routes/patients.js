const router = require('express').Router();
const { authorize } = require('../middleware/roles');
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientsController');

// GET - superadmin, admin, staff pot vedea toti pacientii
// doctorii vad doar pacientii lor (logica in controller)
router.get('/', getAllPatients);
router.get('/:id', getPatientById);

// POST, PUT, DELETE - doar superadmin si admin
router.post('/', authorize('superadmin', 'admin'), createPatient);
router.put('/:id', authorize('superadmin', 'admin'), updatePatient);
router.delete('/:id', authorize('superadmin', 'admin'), deletePatient);

module.exports = router;