// Importam pool-ul de conexiuni la PostgreSQL
const pool = require('../config/db');

// ========================
// GET /api/patients
// Returneaza toti pacientii
// ========================
const getAllPatients = async (req, res) => {
  try {
    let result;

    if (req.user.role === 'doctor') {
      // Doctorul vede doar pacientii care au programari cu el
      result = await pool.query(`
        SELECT DISTINCT p.*
        FROM patients p
        JOIN appointments a ON a.patient_id = p.id
        WHERE a.doctor_id = $1
        ORDER BY p.last_name ASC
      `, [req.user.doctor_id]);
    } else {
      // Superadmin, admin, staff vad toti pacientii
      result = await pool.query(
        'SELECT * FROM patients ORDER BY last_name ASC'
      );
    }

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting patients:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ========================
// GET /api/patients/:id
// Returneaza un pacient dupa ID
// ========================
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        gender,
        address,
        emergency_contact,
        created_at
      FROM patients
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting patient:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// POST /api/patients
// Creeaza un pacient nou
// ========================
const createPatient = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      emergency_contact
    } = req.body;

    // Validam campurile obligatorii
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'first_name, last_name and email are required'
      });
    }

    const result = await pool.query(`
      INSERT INTO patients
        (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating patient:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// PUT /api/patients/:id
// Actualizeaza un pacient
// ========================
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      emergency_contact
    } = req.body;

    const result = await pool.query(`
      UPDATE patients SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        date_of_birth = COALESCE($5, date_of_birth),
        gender = COALESCE($6, gender),
        address = COALESCE($7, address),
        emergency_contact = COALESCE($8, emergency_contact)
      WHERE id = $9
      RETURNING *
    `, [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating patient:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// DELETE /api/patients/:id
// Sterge un pacient
// ========================
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM patients
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting patient:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};