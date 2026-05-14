// Importam pool-ul de conexiuni la PostgreSQL
const pool = require('../config/db');

// ========================
// GET /api/appointments
// Returneaza toate programarile
// ========================
const getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.duration_minutes,
        a.status,
        a.reason,
        a.notes,
        a.created_at,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        p.email AS patient_email,
        d.first_name AS doctor_first_name,
        d.last_name AS doctor_last_name,
        s.name AS specialization
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN specializations s ON s.id = d.specialization_id
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting appointments:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// GET /api/appointments/:id
// Returneaza o programare dupa ID
// ========================
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.duration_minutes,
        a.status,
        a.reason,
        a.notes,
        a.created_at,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        p.email AS patient_email,
        d.first_name AS doctor_first_name,
        d.last_name AS doctor_last_name,
        s.name AS specialization
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN specializations s ON s.id = d.specialization_id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting appointment:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// POST /api/appointments
// Creeaza o programare noua
// ========================
const createAppointment = async (req, res) => {
  try {
    const {
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      duration_minutes,
      reason
    } = req.body;

    // Validam campurile obligatorii
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'patient_id, doctor_id, appointment_date and appointment_time are required'
      });
    }

    // Verificam daca slotul e deja ocupat
    const slotCheck = await pool.query(`
      SELECT id FROM appointments
      WHERE doctor_id = $1
      AND appointment_date = $2
      AND appointment_time = $3
      AND status != 'cancelled'
    `, [doctor_id, appointment_date, appointment_time]);

    if (slotCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'This time slot is already booked'
      });
    }

    const result = await pool.query(`
      INSERT INTO appointments
        (patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [patient_id, doctor_id, appointment_date, appointment_time, duration_minutes || 30, reason]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// PUT /api/appointments/:id
// Actualizeaza o programare
// ========================
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      appointment_date,
      appointment_time,
      duration_minutes,
      status,
      reason,
      notes
    } = req.body;

    // Validam statusul daca e trimis
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const result = await pool.query(`
      UPDATE appointments SET
        appointment_date = COALESCE($1, appointment_date),
        appointment_time = COALESCE($2, appointment_time),
        duration_minutes = COALESCE($3, duration_minutes),
        status = COALESCE($4, status),
        reason = COALESCE($5, reason),
        notes = COALESCE($6, notes),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [appointment_date, appointment_time, duration_minutes, status, reason, notes, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating appointment:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// DELETE /api/appointments/:id
// Anuleaza o programare
// ========================
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Facem soft delete - setam status = cancelled
    const result = await pool.query(`
      UPDATE appointments
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};