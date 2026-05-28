const router = require('express').Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { authorize } = require('../middleware/roles');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// GET /api/users - doar superadmin si admin
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, doctor_id, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users - creeaza user nou
// admin nu poate crea superadmin
router.post('/', async (req, res) => {
  try {
    const { email, password, role, doctor_id } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, parola si rol sunt obligatorii.'
      });
    }

    // Admin nu poate crea superadmin
    if (req.user.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Doar superadminul poate crea alti superadmini.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, doctor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, doctor_id, created_at`,
      [email, password_hash, role, doctor_id || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Emailul este deja folosit.'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/users/:id - actualizeaza user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active, doctor_id } = req.body;

    // Admin nu poate schimba rolul in superadmin
    if (req.user.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Doar superadminul poate atribui rolul de superadmin.'
      });
    }

    const result = await pool.query(
      `UPDATE users SET
        role = COALESCE($1, role),
        is_active = COALESCE($2, is_active),
        doctor_id = COALESCE($3, doctor_id)
       WHERE id = $4
       RETURNING id, email, role, doctor_id, is_active`,
      [role, is_active, doctor_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User negasit.' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/users/:id - doar superadmin
router.delete('/:id', authorize('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Nu poti sterge propriul cont
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Nu iti poti sterge propriul cont.'
      });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User negasit.' });
    }

    res.status(200).json({ success: true, message: 'User dezactivat.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/users/:id/reset-password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;

    // Gasim userul
    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User negasit.' });
    }

    const user = result.rows[0];

    // Generam token unic de resetare
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 ora

    // Salvam tokenul in baza de date
    await pool.query(
      `UPDATE users SET 
        reset_token = $1, 
        reset_token_expiry = $2 
       WHERE id = $3`,
      [resetToken, resetExpiry, id]
    );

    // Trimitem emailul
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const resetUrl = `http://localhost:8080/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Password reset - Medical Clinic',
      html: `
        <h2>Reset password</h2>
        <p>You received this email because you (or someone else) has requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to reset you password.</p>
        <a href="${resetUrl}" style="background:#1a73e8;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">
          Reset the password
        </a>
        <p>The link is available for 1 hour only.</p>
        <p>If you did not requested password change, please report this to our support team.</p>
      `
    });

    res.status(200).json({ success: true, message: 'Email de resetare trimis.' });
  } catch (error) {
    console.error('Error reset password:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});
module.exports = router;