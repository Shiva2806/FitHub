// middleware/validation.js - Replace your entire file with this:

const { body, validationResult } = require('express-validator'); // ADD validationResult import

// Add this middleware function to handle validation errors
// Add this enhanced debugging to your handleValidationErrors function
// Replace your current handleValidationErrors with this version:

const handleValidationErrors = (req, res, next) => {
  console.log('\n🔍 DETAILED VALIDATION DEBUG');
  console.log('Request body received:', JSON.stringify(req.body, null, 2));
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Request body values:', Object.values(req.body));
  
  // Check each field individually
  const { fullName, email, password } = req.body;
  console.log('Extracted fields:');
  console.log('- fullName:', `"${fullName}"`, 'Type:', typeof fullName, 'Length:', fullName?.length);
  console.log('- email:', `"${email}"`, 'Type:', typeof email, 'Length:', email?.length);
  console.log('- password:', `"${password ? '***' + password.slice(-3) : 'undefined'}"`, 'Type:', typeof password, 'Length:', password?.length);
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ VALIDATION FAILED');
    console.log('Raw errors:', errors.array());
    
    // Detailed error analysis
    errors.array().forEach((error, index) => {
      console.log(`\nError ${index + 1}:`);
      console.log('  Field:', error.path || error.param);
      console.log('  Message:', error.msg);
      console.log('  Value received:', `"${error.value}"`);
      console.log('  Type:', typeof error.value);
      console.log('  Location:', error.location);
    });
    
    // Test each validation rule manually
    console.log('\n🧪 MANUAL VALIDATION TESTS:');
    
    // Test fullName
    if (fullName) {
      console.log('✅ fullName exists');
      console.log('- After trim:', `"${fullName.trim()}"`);
      console.log('- Is empty after trim?', fullName.trim() === '');
      console.log('- Length check (2-100):', fullName.length >= 2 && fullName.length <= 100);
      console.log('- Regex test (letters/spaces):', /^[a-zA-Z\s]+$/.test(fullName));
    } else {
      console.log('❌ fullName is missing');
    }
    
    // Test email
    if (email) {
      console.log('✅ email exists');
      console.log('- After trim/lowercase:', `"${email.trim().toLowerCase()}"`);
      console.log('- Email regex test:', /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email));
    } else {
      console.log('❌ email is missing');
    }
    
    // Test password
    if (password) {
      console.log('✅ password exists');
      console.log('- Length >= 6:', password.length >= 6);
      console.log('- Has lowercase:', /[a-z]/.test(password));
      console.log('- Has uppercase:', /[A-Z]/.test(password));
      console.log('- Has digit:', /\d/.test(password));
      console.log('- Full regex test:', /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password));
    } else {
      console.log('❌ password is missing');
    }
    
    // Format errors for response
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      debug: {
        receivedData: req.body,
        fieldCount: Object.keys(req.body).length
      }
    });
  }
  
  console.log('✅ All validation passed - no errors found');
  next();
};

// Validation rules for user registration
const validateSignup = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Validation rules for user login
const validateSignin = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('profile.age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),

  body('profile.gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('profile.height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number')
    .custom((value) => {
      if (value < 100 || value > 300) {
        throw new Error('Height must be between 100 and 300 cm');
      }
      return true;
    }),

  body('profile.weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .custom((value) => {
      if (value < 30 || value > 500) {
        throw new Error('Weight must be between 30 and 500 kg');
      }
      return true;
    }),

  body('profile.bodyType')
    .optional()
    .isIn(['ectomorph', 'mesomorph', 'endomorph'])
    .withMessage('Body type must be ectomorph, mesomorph, or endomorph'),

  body('profile.fitnessLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Fitness level must be beginner, intermediate, or advanced'),

  body('profile.fitnessGoals')
    .optional()
    .isArray()
    .withMessage('Fitness goals must be an array')
    .custom((goals) => {
      const validGoals = ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_health'];
      const invalidGoals = goals.filter(goal => !validGoals.includes(goal));
      if (invalidGoals.length > 0) {
        throw new Error(`Invalid fitness goals: ${invalidGoals.join(', ')}`);
      }
      return true;
    }),

  body('preferences.units')
    .optional()
    .isIn(['metric', 'imperial'])
    .withMessage('Units must be metric or imperial'),

  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be a boolean'),

  body('preferences.notifications.workoutReminders')
    .optional()
    .isBoolean()
    .withMessage('Workout reminders preference must be a boolean'),

  body('preferences.notifications.progressUpdates')
    .optional()
    .isBoolean()
    .withMessage('Progress updates preference must be a boolean')
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Create a simplified validation for testing
// Add this to your validation.js file as an alternative:

const validateSignupSimple = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Update your exports to include the simple version:
module.exports = {
  validateSignup,
  validateSignupSimple, // Add this line
  validateSignin,
  validateProfileUpdate,
  validatePasswordChange,
  handleValidationErrors
};

// Then in your routes/auth.js, temporarily use the simple validation:
//router.post('/signup', validateSignupSimple, handleValidationErrors, signup);