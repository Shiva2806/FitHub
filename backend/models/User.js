const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  profile: {
    bodyType: {
      type: String,
      enum: {
        values: ['ectomorph', 'mesomorph', 'endomorph'],
        message: 'Body type must be ectomorph, mesomorph, or endomorph'
      },
      required: false
    },
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120'],
      required: false
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Gender must be male, female, or other'
      },
      required: false
    },
    height: {
      type: Number, // in cm
      min: [100, 'Height must be at least 100cm'],
      max: [300, 'Height cannot exceed 300cm'],
      required: false
    },
    weight: {
      type: Number, // in kg
      min: [30, 'Weight must be at least 30kg'],
      max: [500, 'Weight cannot exceed 500kg'],
      required: false
    },
    fitnessLevel: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Fitness level must be beginner, intermediate, or advanced'
      },
      required: false
    },
    fitnessGoals: [{
      type: String,
      enum: {
        values: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'general_health'],
        message: 'Invalid fitness goal'
      }
    }]
  },
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      workoutReminders: {
        type: Boolean,
        default: true
      },
      progressUpdates: {
        type: Boolean,
        default: true
      }
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Virtual for full profile completion percentage
userSchema.virtual('profileCompletionPercentage').get(function() {
  const requiredFields = ['fullName', 'email'];
  const profileFields = ['profile.age', 'profile.gender', 'profile.height', 'profile.weight'];
  const optionalFields = ['profile.bodyType', 'profile.fitnessLevel', 'profile.fitnessGoals'];
  
  let completedRequired = 0;
  let completedProfile = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value !== null && value !== undefined && value !== '') {
      completedRequired++;
    }
  });
  
  // Check profile fields
  profileFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value !== null && value !== undefined && value !== '') {
      completedProfile++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (value !== null && value !== undefined && value !== '' && 
        (!Array.isArray(value) || value.length > 0)) {
      completedOptional++;
    }
  });
  
  const totalFields = requiredFields.length + profileFields.length + optionalFields.length;
  const totalCompleted = completedRequired + completedProfile + completedOptional;
  
  return Math.round((totalCompleted / totalFields) * 100);
});

module.exports = mongoose.model('User', userSchema);