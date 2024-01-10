const admin = require('../../firebase-config');

function authMiddleware(req, res, next) {
  const idToken = req.header('Authorization').split(" ")[1];


  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized - Missing token' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // Attach user information to the request
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Unauthorized - Invalid token' });
    });
}

module.exports = authMiddleware;