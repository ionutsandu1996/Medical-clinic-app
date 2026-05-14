// Importam Router din Express
const router = require('express').Router();

// Importam controller-ul pentru fise medicale
const {
  getPatientRecords,
  getRecordById,
  createRecord,
  updateRecord
} = require('../controllers/medicalRecordsController');

// GET /api/medical-records/patient/:patientId - fisele unui pacient
router.get('/patient/:patientId', getPatientRecords);

// GET /api/medical-records/:id - o fisa dupa ID
router.get('/:id', getRecordById);

// POST /api/medical-records - creeaza fisa medicala
router.post('/', createRecord);

// PUT /api/medical-records/:id - actualizeaza fisa
router.put('/:id', updateRecord);

module.exports = router;