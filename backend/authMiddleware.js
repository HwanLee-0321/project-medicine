const jwt = require('jsonwebtoken');
const User = require('./db/Users');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object
      // We can also fetch the user from DB to ensure they still exist
      const user = await User.findByPk(decoded.user_id);
      if (!user || user.delyn === 'Y') {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      req.user = user; // Attach the full user object

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
