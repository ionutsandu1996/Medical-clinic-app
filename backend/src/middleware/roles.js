// Middleware factory — primeste o lista de roluri permise
// si returneaza un middleware care verifica rolul userului
// Folosire: router.get('/ruta', authenticate, authorize('admin', 'superadmin'), handler)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user e setat de middleware-ul authenticate
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Neautentificat.'
      });
    }

    // Verificam daca rolul userului e in lista de roluri permise
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden. Neeed role: ${allowedRoles.join(' or ')}.`
      });
    }

    next();
  };
};

module.exports = { authorize };