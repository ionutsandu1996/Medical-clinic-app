const pool = require('../config/db');

const getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Doctorul poate vedea doar fisele pacientilor lui
    if (req.user.role === 'doctor') {
      const check = await pool.query(`
        SELECT DISTINCT p.id
        FROM patients p
        JOIN appointments a ON a.patient_id = p.id
        WHERE p.id = $1 AND a.doctor_id = $2
      `, [patientId, req.user.doctor_id]);

      if (check.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Nu ai acces la fisele acestui pacient.'
        });
      }
    }

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
    res.status(500).json({ success: false, error: error.message });
  }
};

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
      return res.status(404).json({ success: false, error: 'Medical record not found' });
    }

    // Doctorul poate vedea doar fisele lui
    if (req.user.role === 'doctor' && result.rows[0].doctor_id !== req.user.doctor_id) {
      return res.status(403).json({
        success: false,
        error: 'Nu ai acces la aceasta fisa medicala.'
      });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error getting medical record:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

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

    if (!appointment_id || !patient_id || !doctor_id) {
      return res.status(400).json({
        success: false,
        error: 'appointment_id, patient_id and doctor_id are required'
      });
    }

    // Doctorul poate crea fise doar cu doctor_id = id-ul lui
    if (req.user.role === 'doctor' && parseInt(doctor_id) !== req.user.doctor_id) {
      return res.status(403).json({
        success: false,
        error: 'Nu poti crea fise medicale pentru alt doctor.'
      });
    }

    const appointmentCheck = await pool.query(
      'SELECT id FROM appointments WHERE id = $1',
      [appointment_id]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const result = await pool.query(`
      INSERT INTO medical_records
        (appointment_id, patient_id, doctor_id, diagnosis, treatment, prescription, notes)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [appointment_id, patient_id, doctor_id, diagnosis, treatment, prescription, notes]);

    await pool.query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2',
      ['completed', appointment_id]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating medical record:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;

    // Doctorul poate modifica DOAR notes din fisele lui
    if (req.user.role === 'doctor') {
      const { notes } = req.body;

      const check = await pool.query(
        'SELECT id FROM medical_records WHERE id = $1 AND doctor_id = $2',
        [id, req.user.doctor_id]
      );

      if (check.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Nu ai acces la aceasta fisa medicala.'
        });
      }

      const result = await pool.query(
        'UPDATE medical_records SET notes = $1 WHERE id = $2 RETURNING *',
        [notes, id]
      );

      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    // superadmin, admin pot modifica orice
    const { diagnosis, treatment, prescription, notes } = req.body;

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
      return res.status(404).json({ success: false, error: 'Medical record not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating medical record:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPatientRecords,
  getRecordById,
  createRecord,
  updateRecord
};