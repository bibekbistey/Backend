const fs = require('fs');
const morgan = require('morgan');

// Create a custom token for user information
morgan.token('user', (req) => {
  const user = req.user;
  return user ? `${user.name}` : 'anonymous';
});

// Create a write stream to the log file
const accessLogStream = fs.createWriteStream('user_audit_logs.txt', { flags: 'a' });

// Create a morgan middleware with custom format
const userAuditLogger = morgan(':date[iso] :method :url :status - User: :user', {
  stream: accessLogStream,
});

module.exports = userAuditLogger;
