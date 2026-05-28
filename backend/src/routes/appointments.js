const router = require('express').Router();
const { authorize } = require('../middleware/roles');
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentsController');

// GET - toti pot vedea programarile
// doctorii vad doar programarile lor (logica in controller)
router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);

// POST - superadmin, admin, staff pot crea programari
router.post('/', authorize('superadmin', 'admin', 'staff'), createAppointment);

// PUT - superadmin, admin, staff pot modifica
// doctorii pot adauga doar note (logica in controller)
router.put('/:id', updateAppointment);

// DELETE - doar superadmin, admin, staff
router.delete('/:id', authorize('superadmin', 'admin', 'staff'), deleteAppointment);

module.exports = router;