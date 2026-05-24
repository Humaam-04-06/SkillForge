const cors = require('cors');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

module.exports = cors(corsOptions);
