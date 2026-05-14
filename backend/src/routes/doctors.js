// Importam Router din Express pentru a defini rutele
const router = require('express').Router();

// Importam controller-ul pentru doctori
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorsController');

// GET /api/doctors - toti doctorii
router.get('/', getAllDoctors);

// GET /api/doctors/:id - un doctor dupa ID
router.get('/:id', getDoctorById);

// POST /api/doctors - creeaza doctor nou
router.post('/', createDoctor);

// PUT /api/doctors/:id - actualizeaza doctor
router.put('/:id', updateDoctor);

// DELETE /api/doctors/:id - dezactiveaza doctor
router.delete('/:id', deleteDoctor);

// Exportam router-ul
module.exports = router;