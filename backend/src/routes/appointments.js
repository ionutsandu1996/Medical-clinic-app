// Importam Router din Express
const router = require('express').Router();

// Importam controller-ul pentru programari
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentsController');

// GET /api/appointments - toate programarile
router.get('/', getAllAppointments);

// GET /api/appointments/:id - o programare dupa ID
router.get('/:id', getAppointmentById);

// POST /api/appointments - creeaza programare noua
router.post('/', createAppointment);

// PUT /api/appointments/:id - actualizeaza programare
router.put('/:id', updateAppointment);

// DELETE /api/appointments/:id - anuleaza programare
router.delete('/:id', deleteAppointment);

module.exports = router;