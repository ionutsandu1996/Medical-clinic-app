// Import the Express framework to create a HTTP web server
const express = require('express');

// Import cors -- allows React frontend (port 5173) to communicate with the backend (port 3000)
 const cors = require('cors');

 // Import helmet -- helps secure Express apps by setting various HTTP headers
 const helmet = require('helmet');

 // Import morgan -- HTTP request logger middleware for Node.js. (metadata, routes, status, time)
 const morgan = require('morgan');

 // Load env variables from .env (Port, DB_URL, etc)
 require('dotenv').config();

 const pool = require('./config/db');

 // Create app instance
 const app = express();

 // define the port
 const PORT = process.env.PORT || 3000;

 // ===============
 // Middleware
 //===============

 // Activate helmet - protects against well-known web attacks
 app.use(helmet());

 // Activate cors - allows cross-origin requests (React + Express)
 app.use(cors());

 // Activate morgan - logs HTTP requests to the console
 app.use(morgan('dev'));

 app.use(express.json());

 // Allow reading the data sent from HTML forms
 app.use(express.urlencoded({ extended: true }));


 // ===============
// Routes
// ===============

// Define the health check route -- used by Kubernetes for liveness/readiness probes
app.get('/health', (req,res) => {
    res.status(200).json({
        status: 'ok',

        //timestamp
        timestamp: new Date().toISOString(),

        service: 'clinic-api'
    });
});

// API Routes 
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/medical-records', require('./routes/medicalRecords'));

// ===============
// Error handler
// ===============

// Global middleware to catch errors
// Express recongnizes middleware errors by the fact of the 4 parameters (err, req, res, next)
app.use((err, req, res, next) => {
    
    // show error's stack trace in terminal for debugging
    console.error(err.stack);

    // Return a JSON response with the error details
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start the server

app.listen(PORT, () => {
    console.log(`Server runnning on port ${PORT}`);

    // Show the health check URL
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Export the app for testing purposes (if needed)
module.exports = app;