const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

// ========================
// POST /api/auth/login
// ========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email si parola sunt obligatorii.'
      });
    }

    // Cautam userul dupa email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      // Returnam acelasi mesaj pentru email inexistent si parola gresita
      // Securitate: nu dezvaluim daca emailul exista sau nu
      return res.status(401).json({
        success: false,
        error: 'Email sau parola incorecte.'
      });
    }

    const user = result.rows[0];

    // Comparam parola trimisa cu hash-ul din baza de date
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email sau parola incorecte.'
      });
    }

    // Generam JWT token cu datele userului
    // Aceste date vor fi disponibile in req.user dupa autentificare
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        doctor_id: user.doctor_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Actualizam last_login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        doctor_id: user.doctor_id
      }
    });
  } catch (error) {
    console.error('Error login:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// GET /api/auth/me
// Returneaza datele userului logat
// ========================
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, doctor_id, created_at, last_login FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User negasit.' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================
// POST /api/auth/register
// Doar superadmin si admin pot crea useri noi
// ========================
router.post('/register', authenticate, async (req, res) => {
  try {
    // Verificam ca doar superadmin sau admin poate crea useri
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Doar adminii pot crea useri noi.'
      });
    }

    const { email, password, role, doctor_id } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, parola si rol sunt obligatorii.'
      });
    }

    // Adminul de onboarding nu poate crea superadmini
    if (req.user.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Doar superadminul poate crea alti superadmini.'
      });
    }

    // Hash-uim parola inainte de salvare
    // Salt rounds = 10 = balanta buna intre securitate si viteza
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

// ========================
// POST /api/auth/reset-password
// Reseteaza parola cu token din email
// ========================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token si parola noua sunt obligatorii.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Parola trebuie sa aiba cel putin 6 caractere.'
      });
    }

    // Gasim userul cu tokenul valid si neexpirat
    const result = await pool.query(
      `SELECT id, email FROM users 
       WHERE reset_token = $1 
       AND reset_token_expiry > NOW()
       AND is_active = true`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Token invalid sau expirat.'
      });
    }

    const user = result.rows[0];

    // Hash parola noua
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Actualizam parola si stergem tokenul
    await pool.query(
      `UPDATE users SET 
        password_hash = $1,
        reset_token = NULL,
        reset_token_expiry = NULL
       WHERE id = $2`,
      [password_hash, user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Parola a fost resetata cu succes.'
    });
  } catch (error) {
    console.error('Error reset password:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


module.exports = router;