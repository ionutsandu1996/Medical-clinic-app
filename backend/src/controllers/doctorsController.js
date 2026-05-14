// Importam pool-ul de conexiuni la PostgreSQL
const pool = require('../config/db');

// ========================
// GET /api/doctors
// Returneaza toti doctorii
// ========================
const getAllDoctors = async (req, res) => {
  try {
    // Interogam baza de date pentru toti doctorii activi
    // JOIN cu specializations ca sa returnam si numele specializarii
    const result = await pool.query(`
      SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.email,
        d.phone,
        d.bio,
        d.avatar_url,
        d.is_active,
        d.created_at,
        s.name AS specialization
      FROM doctors d
      LEFT JOIN specializations s ON s.id = d.specialization_id
      WHERE d.is_active = true
      ORDER BY d.last_name ASC
    `);

    // Returnam lista de doctori
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting doctors:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// GET /api/doctors/:id
// Returneaza un doctor dupa ID
// ========================
const getDoctorById = async (req, res) => {
  try {
    // Extragem ID-ul din parametrii rutei
    const { id } = req.params;

    // Interogam baza de date pentru doctorul cu ID-ul specificat
    const result = await pool.query(`
      SELECT 
        d.id,
        d.first_name,
        d.last_name,
        d.email,
        d.phone,
        d.bio,
        d.avatar_url,
        d.is_active,
        d.created_at,
        s.name AS specialization
      FROM doctors d
      LEFT JOIN specializations s ON s.id = d.specialization_id
      WHERE d.id = $1
    `, [id]);

    // Daca doctorul nu exista returnam 404
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Returnam doctorul gasit
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error getting doctor:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// POST /api/doctors
// Creeaza un doctor nou
// ========================
const createDoctor = async (req, res) => {
  try {
    // Extragem datele din body-ul requestului
    const {
      first_name,
      last_name,
      email,
      phone,
      specialization_id,
      bio,
      avatar_url
    } = req.body;

    // Validam campurile obligatorii
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'first_name, last_name and email are required'
      });
    }

    // Inseram doctorul in baza de date
    const result = await pool.query(`
      INSERT INTO doctors 
        (first_name, last_name, email, phone, specialization_id, bio, avatar_url)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [first_name, last_name, email, phone, specialization_id, bio, avatar_url]);

    // Returnam doctorul creat cu status 201
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating doctor:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// PUT /api/doctors/:id
// Actualizeaza un doctor
// ========================
const updateDoctor = async (req, res) => {
  try {
    // Extragem ID-ul din parametrii rutei
    const { id } = req.params;

    // Extragem datele din body-ul requestului
    const {
      first_name,
      last_name,
      email,
      phone,
      specialization_id,
      bio,
      avatar_url,
      is_active
    } = req.body;

    // Actualizam doctorul in baza de date
    const result = await pool.query(`
      UPDATE doctors SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        specialization_id = COALESCE($5, specialization_id),
        bio = COALESCE($6, bio),
        avatar_url = COALESCE($7, avatar_url),
        is_active = COALESCE($8, is_active)
      WHERE id = $9
      RETURNING *
    `, [first_name, last_name, email, phone, specialization_id, bio, avatar_url, is_active, id]);

    // Daca doctorul nu exista returnam 404
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Returnam doctorul actualizat
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating doctor:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ========================
// DELETE /api/doctors/:id
// Sterge un doctor (soft delete)
// ========================
const deleteDoctor = async (req, res) => {
  try {
    // Extragem ID-ul din parametrii rutei
    const { id } = req.params;

    // Facem soft delete - setam is_active = false in loc sa stergem
    // Astfel pastram istoricul programarilor
    const result = await pool.query(`
      UPDATE doctors 
      SET is_active = false 
      WHERE id = $1
      RETURNING *
    `, [id]);

    // Daca doctorul nu exista returnam 404
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Confirnam stergerea
    res.status(200).json({
      success: true,
      message: 'Doctor deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Exportam toate functiile controller
module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};