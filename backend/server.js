const cors = require('cors');
const express = require('express');

const { corsOrigin, port } = require('./config/env');
const analyzeRoutes = require('./routes/analyzeRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

const corsOptions = corsOrigin === '*'
  ? { origin: true }
  : {
      origin: corsOrigin.split(',').map((value) => value.trim()).filter(Boolean)
    };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PDF Analyzer API is running.'
  });
});

app.use('/api', analyzeRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`PDF Analyzer backend running on port ${port}`);
});
