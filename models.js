const mongoose = require('mongoose');
const { Schema } = mongoose;

// User model

// User model
const userSchema = new Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String, // Store the file path or URL
    default: null,
  },
  no_of_images_left: {
    type: Number,
    required: true,
    default: 0,
  },
  subscribed_monthly: {
    type: Boolean,
    required: true,
    default: false,
  },
  subscribed_yearly: {
    type: Boolean,
    required: true,
    default: false,
  },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  requestedSubscription: {
    type: Schema.Types.ObjectId,
    ref: 'Subscription', // Points to the requested subscription
    default: null,
  },
  subscription_date: {
    type: Date,
    default: null,
  },
  paymentId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'PAY_METHOD_SELECTED', 'COMPLETED', 'FAILED'],
  },
});



const User = mongoose.model('User', userSchema);

// User has many GeneratedImages
userSchema.virtual('generatedImages', {
  ref: 'GeneratedImage',
  localField: '_id',
  foreignField: 'userId',
});

// Subscription model
const subscriptionSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  priceMonthly: {
    type: Number,
    required: true,
  },
  priceYearly: {
    type: Number,
    required: true,
  },
  generatedImages: {
    type: Number,
    required: true,
  },
  generationSpeed: {
    type: String,
    required: true,
  },
  videoGenerations: {
    type: Number,
    required: true,
  },
  licenseType: {
    type: String,
    required: true,
  },
  privacy: {
    type: String,
    required: true,
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Subscription has many Users
subscriptionSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'subscription',
});

// GeneratedImage model
const generatedImageSchema = new Schema({
  image: {
    type: Buffer,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

const GeneratedImage = mongoose.model('GeneratedImage', generatedImageSchema);

// GeneratedImage belongs to User
generatedImageSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
});

module.exports = { User, Subscription, GeneratedImage };
