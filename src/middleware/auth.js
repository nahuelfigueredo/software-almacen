const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado'
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
