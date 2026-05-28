const router = require('express').Router();
const { authorize } = require('../middleware/roles');
const {
  getPatientRecords,
  getRecordById,
  createRecord,
  updateRecord
} = require('../controllers/medicalRecordsController');

// GET - toti pot vedea fisele medicale
// doctorii vad doar fisele pacientilor lor (logica in controller)
router.get('/patient/:patientId', getPatientRecords);
router.get('/:id', getRecordById);

// POST - superadmin, admin, si doctorii pot crea fise medicale
router.post('/', authorize('superadmin', 'admin', 'doctor'), createRecord);

// PUT - superadmin, admin pot modifica orice
// doctorii pot modifica doar notele din fisele lor (logica in controller)
router.put('/:id', updateRecord);

module.exports = router;