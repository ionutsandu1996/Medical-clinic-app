// Importam pool-ul de conexiuni la PostgreSQL
const pool = require('../config/db');

// ========================
// GET /api/medical-records/patient/:patientId
// Returneaza toate fisele medicale ale unui pacient
// ========================
const getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await pool.query(`
  SELECT
    mr.id,
    mr.appointment_id,
    mr.doctor_id,
    mr.diagnosis,
    mr.treatment,
    mr.prescription,
    mr.notes,
    mr.created_at,
    a.appointment_date,
    a.appointment_time,
    d.first_name AS doctor_first_name,
    d.last_name AS doctor_last_name,
    s.name AS specialization
  FROM medical_records mr
  JOIN appointments a ON a.id = mr.appointment_id
  JOIN doctors d ON d.id = mr.doctor_id
  LEFT JOIN specializations s ON s.id = d.specialization_id
  WHERE mr.patient_id = $1
  ORDER BY mr.created_at DESC
`, [patientId]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting medical records:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// GET /api/medical-records/:id
// Returneaza o fisa medicala dupa ID
// ========================
const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        mr.id,
        mr.diagnosis,
        mr.treatment,
        mr.prescription,
        mr.notes,
        mr.created_at,
        a.appointment_date,
        a.appointment_time,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        d.first_name AS doctor_first_name,
        d.last_name AS doctor_last_name,
        s.name AS specialization
      FROM medical_records mr
      JOIN appointments a ON a.id = mr.appointment_id
      JOIN patients p ON p.id = mr.patient_id
      JOIN doctors d ON d.id = mr.doctor_id
      LEFT JOIN specializations s ON s.id = d.specialization_id
      WHERE mr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting medical record:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// POST /api/medical-records
// Creeaza o fisa medicala noua
// ========================
const createRecord = async (req, res) => {
  try {
    const {
      appointment_id,
      patient_id,
      doctor_id,
      diagnosis,
      treatment,
      prescription,
      notes
    } = req.body;

    // Validam campurile obligatorii
    if (!appointment_id || !patient_id || !doctor_id) {
      return res.status(400).json({
        success: false,
        error: 'appointment_id, patient_id and doctor_id are required'
      });
    }

    // Verificam daca programarea exista si e completata
    const appointmentCheck = await pool.query(`
      SELECT id, status FROM appointments
      WHERE id = $1
    `, [appointment_id]);

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const result = await pool.query(`
      INSERT INTO medical_records
        (appointment_id, patient_id, doctor_id, diagnosis, treatment, prescription, notes)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [appointment_id, patient_id, doctor_id, diagnosis, treatment, prescription, notes]);

    // Marcam programarea ca finalizata
    await pool.query(`
      UPDATE appointments
      SET status = 'completed', updated_at = NOW()
      WHERE id = $1
    `, [appointment_id]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating medical record:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// PUT /api/medical-records/:id
// Actualizeaza o fisa medicala
// ========================
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      diagnosis,
      treatment,
      prescription,
      notes
    } = req.body;

    const result = await pool.query(`
      UPDATE medical_records SET
        diagnosis = COALESCE($1, diagnosis),
        treatment = COALESCE($2, treatment),
        prescription = COALESCE($3, prescription),
        notes = COALESCE($4, notes)
      WHERE id = $5
      RETURNING *
    `, [diagnosis, treatment, prescription, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Medical record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating medical record:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getPatientRecords,
  getRecordById,
  createRecord,
  updateRecord
};