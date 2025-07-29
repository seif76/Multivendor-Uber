const jwt = require('jsonwebtoken');

class SocketAuth {
  static authenticate(socket, next) {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  }

  static requireRole(role) {
    return (socket, next) => {
      if (!socket.user) {
        return next(new Error('Authentication required'));
      }

      const userStatus = socket.user[`${role}_status`];
      if (userStatus !== 'Active' && userStatus !== 'pending') {
        return next(new Error(`Access denied: ${role} role required`));
      }

      next();
    };
  }
}

module.exports = SocketAuth; 