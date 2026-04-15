const express = require('express');
const cors = require('cors');

const errorHandler = require('./common/errorHandler');
const profileRoutes = require('./modules/profile/profile.route');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use('/api/v1/profile', profileRoutes);

app.use(errorHandler);

module.exports = app;
