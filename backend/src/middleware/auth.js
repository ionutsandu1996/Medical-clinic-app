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

module.exports = { authenticate };