const jwt = require('jsonwebtoken');

// Middleware care verifica daca request-ul are un JWT valid
// Se ruleaza INAINTE de orice route protejata
const authenticate = (req, res, next) => {
  // Tokenul vine in header-ul Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acces refuzat. Token lipsa.'
    });
  }

  // Extragem tokenul din header (dupa "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verificam si decodam tokenul cu secretul din .env
    // Daca tokenul e invalid sau expirat, jwt.verify arunca eroare
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Atasam datele userului la request
    // Accesibil in orice route ca req.user
    req.user = decoded;

    // Continuam catre route handler
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token invalid sau expirat.'
    });
  }
};

// POST /api/auth/reset-password
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

    // Gasim userul cu tokenul valid si nexppirat
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

module.exports = { authenticate };