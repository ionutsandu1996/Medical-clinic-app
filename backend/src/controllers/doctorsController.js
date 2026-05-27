const pool = require('../config/db');

const getAllDoctors = async (req, res) => {
  try {
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
        d.specialization_id,
        s.name AS specialization
      FROM doctors d
      LEFT JOIN specializations s ON s.id = d.specialization_id
      WHERE d.is_active = true
      ORDER BY d.last_name ASC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error getting doctors:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

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
        d.specialization_id,
        s.name AS specialization
      FROM doctors d
      LEFT JOIN specializations s ON s.id = d.specialization_id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error getting doctor:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, specialization_id, bio, avatar_url } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'first_name, last_name and email are required'
      });
    }

    const result = await pool.query(`
      INSERT INTO doctors 
        (first_name, last_name, email, phone, specialization_id, bio, avatar_url)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [first_name, last_name, email, phone, specialization_id, bio, avatar_url]);

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating doctor:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, specialization_id, bio, avatar_url, is_active } = req.body;

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

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating doctor:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      UPDATE doctors 
      SET is_active = false 
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    res.status(200).json({ success: true, message: 'Doctor deactivated successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};