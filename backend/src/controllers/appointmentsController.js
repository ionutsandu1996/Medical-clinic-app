const pool = require('../config/db');

const getAllAppointments = async (req, res) => {
  try {
    let result;

    if (req.user.role === 'doctor') {
      result = await pool.query(`
        SELECT 
          a.*,
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
        WHERE a.doctor_id = $1
        ORDER BY a.appointment_date ASC, a.appointment_time ASC
      `, [req.user.doctor_id]);
    } else {
      result = await pool.query(`
        SELECT 
          a.*,
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
    }

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting appointments:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        a.*,
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
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error getting appointment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason } = req.body;

    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'patient_id, doctor_id, appointment_date and appointment_time are required'
      });
    }

    const slotCheck = await pool.query(`
      SELECT id FROM appointments
      WHERE doctor_id = $1
      AND appointment_date = $2
      AND appointment_time = $3
      AND status != 'cancelled'
    `, [doctor_id, appointment_date, appointment_time]);

    if (slotCheck.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'This time slot is already booked' });
    }

    const result = await pool.query(`
      INSERT INTO appointments
        (patient_id, doctor_id, appointment_date, appointment_time, duration_minutes, reason)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [patient_id, doctor_id, appointment_date, appointment_time, duration_minutes || 30, reason]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Doctorul poate modifica DOAR notes
    if (req.user.role === 'doctor') {
      const { notes } = req.body;

      const check = await pool.query(
        'SELECT id FROM appointments WHERE id = $1 AND doctor_id = $2',
        [id, req.user.doctor_id]
      );

      if (check.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Nu ai acces la aceasta programare.'
        });
      }

      const result = await pool.query(
        'UPDATE appointments SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [notes, id]
      );

      return res.status(200).json({ success: true, data: result.rows[0] });
    }

    // superadmin, admin, staff pot modifica orice
    const { appointment_date, appointment_time, duration_minutes, status, reason, notes } = req.body;

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
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating appointment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE appointments
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.status(200).json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};