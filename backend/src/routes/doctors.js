const router = require('express').Router();
const { authorize } = require('../middleware/roles');
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorsController');

// GET - toti utilizatorii autentificati pot vedea doctori
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// POST, PUT, DELETE - doar superadmin si admin
router.post('/', authorize('superadmin', 'admin'), createDoctor);
router.put('/:id', authorize('superadmin', 'admin'), updateDoctor);
router.delete('/:id', authorize('superadmin', 'admin'), deleteDoctor);

module.exports = router;