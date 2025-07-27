const mongoose = require('mongoose');
const { Schema } = mongoose;

// User model

// User model
const userSchema = new Schema({
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['individual', 'company'], default: 'individual', required: true },
  companyName: { type: String, default: null },
  address: { type: String, default: null },
  vatNumber: { type: String, default: null },
  profilePic: { type: String, default: null },

  // Resource tracking
  no_of_images_left: {
    type: Number,
    required: true,
    default: 0,
  },
  imagesLeft: { type: Number, default: 0 },
  videosLeft: { type: Number, default: 0 },
  modelsLeft: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },

  subscribed_monthly: { type: Boolean, default: false },
  subscribed_yearly: { type: Boolean, default: false },

  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
  requestedSubscription: { type: Schema.Types.ObjectId, ref: 'Subscription', default: null },
  subscription_date: { type: Date, default: null },
  paymentId: { type: String, default: null },
  paymentStatus: {
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'PAY_METHOD_SELECTED', 'COMPLETED', 'FAILED'],
  },

  googleId: { type: String, unique: true, sparse: true },
  appleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String },
  autoRenew: { type: Boolean, default: false },

  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  nextBillingDate: { type: Date, default: null }, // for cron-based triggers
  
  // Payment tracking fields
  changeType: { type: String, enum: ['new', 'upgrade', 'downgrade', 'same'], default: null },
  pendingCoinPurchase: { type: Number, default: null }, // Track coin purchases in progress

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
  name: { type: String, required: true, unique: true },
  priceMonthly: { type: Number, required: true },
  priceYearly: { type: Number, required: true },
  generatedImages: { type: Number, required: true },
  videoGenerations: { type: Number, required: true },
  models3d: { type: Number, required: true },
  generationSpeed: { type: String, required: true },
  licenseType: { type: String, required: true },
  privacy: { type: String, required: true },
  coins: { type: Number, required: true }, // NEW
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Subscription has many Users
subscriptionSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'subscription',
});

// GeneratedImage model
// const generatedImageSchema = new Schema({
//   image: {
//     type: Buffer,
//     required: true,
//   },
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//   },
// });

// const GeneratedImage = mongoose.model('GeneratedImage', generatedImageSchema);




// const GeneratedImageSchema = new mongoose.Schema({
//   image: Buffer,
//   title: String,
//   description: String,
//   category: String,
//   likes: { type: Number, default: 0 },
//   shares: { type: Number, default: 0 },
//   views: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   type: { type: String, enum: ['image', '3d_model', 'enhanced_image'], default: 'image' },
//   modelUrl: { type: String, default: null }
// });
const GeneratedImageSchema = new mongoose.Schema({
  image: Buffer,
  imageUrl: String, // base64 or external URL if stored on S3 or similar
  prompt: String,
  negativePrompt: String,
  width: Number,
  height: Number,
  steps: Number,
  guidanceScale: Number,
  seed: Number,
  scheduler: String,
  clipSkip: Number,
  style: String,
  model: String, // or model_xl: Boolean
  category: String,
  title: String,
  description: String,
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['image', '3d_model', 'enhanced_image','video'], default: 'image' },
  modelUrl: { type: String, default: null }
});

const GeneratedImage = mongoose.model('GeneratedImage', GeneratedImageSchema);
// module.exports = { GeneratedImage };

// GeneratedImage belongs to User
// generatedImageSchema.virtual('user', {
//   ref: 'User',
//   localField: 'userId',
//   foreignField: '_id',
// });





module.exports = { User, Subscription, GeneratedImage };
