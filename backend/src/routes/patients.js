// Importam Router din Express
const router = require('express').Router();

// Importam controller-ul pentru pacienti
const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientsController');

// GET /api/patients - toti pacientii
router.get('/', getAllPatients);

// GET /api/patients/:id - un pacient dupa ID
router.get('/:id', getPatientById);

// POST /api/patients - creeaza pacient nou
router.post('/', createPatient);

// PUT /api/patients/:id - actualizeaza pacient
router.put('/:id', updatePatient);

// DELETE /api/patients/:id - sterge pacient
router.delete('/:id', deletePatient);

module.exports = router;