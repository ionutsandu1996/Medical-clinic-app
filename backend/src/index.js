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
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

 // Activate morgan - logs HTTP requests to the console
 app.use(morgan('dev'));

 app.use(express.json());

 // Allow reading the data sent from HTML forms
 app.use(express.urlencoded({ extended: true }));



const {authenticate} = require('./middleware/auth');
const { authorize } = require('./middleware/roles');
 // ===============
// Routes
// ===============

// Define the health check route -- used by Kubernetes for liveness/readiness probes
// Health check - PUBLIC
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'clinic-api'
  });
});

// Auth - PUBLIC
app.use('/api/auth', require('./routes/auth'));

// Specializari - toti utilizatorii autentificati pot vedea
app.use('/api/specializations', authenticate, require('./routes/specializations'));

// Doctori - toti pot vedea, doar superadmin si admin pot modifica
// Restrictia de READ vs CRUD o facem in controller
app.use('/api/doctors', authenticate, require('./routes/doctors'));

// Pacienti - superadmin, admin, staff pot vedea toti
// doctorii vad doar pacientii lor (logica in controller)
app.use('/api/patients', authenticate, require('./routes/patients'));

// Programari - superadmin, admin, staff au CRUD
// doctorii pot doar citi si adauga note
app.use('/api/appointments', authenticate, require('./routes/appointments'));

// Fise medicale - superadmin, admin au CRUD
// staff poate doar citi
// doctorii pot crea si adauga note la fisele lor
app.use('/api/medical-records', authenticate, require('./routes/medicalRecords'));

// Useri - doar superadmin si admin
app.use('/api/users', authenticate, authorize('superadmin', 'admin'), require('./routes/users'));
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