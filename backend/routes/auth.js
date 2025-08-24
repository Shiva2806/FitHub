const express = require('express');
const router = express.Router();

const {
  signup,
  signin,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/authController');

const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const {
  validateSignup,
  validateSignin,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors // Import the new error handler
} = require('../middleware/validation');

// Debug middleware (temporary - remove after fixing)
router.use((req, res, next) => {
  console.log('\n📍 AUTH ROUTER - Route:', req.method, req.path);
  console.log('Body:', req.body);
  next();
});

// Public routes - Note the order: validation rules first, then error handler, then controller
router.post('/signup', validateSignup, handleValidationErrors, signup);
router.post('/signin', validateSignin, handleValidationErrors, signin);

// Protected routes (require authentication)
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateProfileUpdate, handleValidationErrors, updateProfile);
router.put('/change-password', authenticate, validatePasswordChange, handleValidationErrors, changePassword);
router.delete('/account', authenticate, deleteAccount);

// Test route (temporary - remove after fixing)
router.post('/test', (req, res) => {
  console.log('🧪 Test route hit with body:', req.body);
  res.json({
    success: true,
    message: 'Test route working',
    receivedData: req.body
  });
});

module.exports = router;

// Add this test route to your routes/auth.js file temporarily:

router.post('/debug-signup', (req, res) => {
  console.log('\n🧪 DEBUG SIGNUP ROUTE HIT');
  console.log('Headers:', {
    'content-type': req.headers['content-type'],
    'origin': req.headers.origin
  });
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body));
  console.log('Body stringified:', JSON.stringify(req.body, null, 2));
  
  // Check each field
  const { fullName, email, password } = req.body;
  console.log('\nField analysis:');
  console.log('fullName:', {
    value: fullName,
    type: typeof fullName,
    length: fullName?.length,
    trimmed: fullName?.trim(),
    empty: !fullName || fullName.trim() === ''
  });
  
  console.log('email:', {
    value: email,
    type: typeof email,
    length: email?.length,
    trimmed: email?.trim(),
    empty: !email || email.trim() === ''
  });
  
  console.log('password:', {
    value: password ? '***hidden***' : undefined,
    type: typeof password,
    length: password?.length,
    empty: !password || password === ''
  });
  
  res.json({
    success: true,
    message: 'Debug route working',
    receivedData: {
      fullName: fullName || 'MISSING',
      email: email || 'MISSING',
      password: password ? 'PROVIDED' : 'MISSING'
    },
    dataTypes: {
      fullName: typeof fullName,
      email: typeof email,
      password: typeof password
    }
  });
});

// Test this route first with your frontend:
// Change your frontend to call: http://localhost:5000/api/auth/debug-signup
// This will show us exactly what data is being sent