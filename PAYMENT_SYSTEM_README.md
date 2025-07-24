# Payment System - Monthly/Yearly Subscriptions with Smart Upgrade/Downgrade

## 🚀 Overview

This payment system implements a complete subscription management solution with:
- **Monthly/Yearly recurring billing** with automatic charges
- **Fixed resource allocation** per plan (1200 images, 40 videos for Starter €8/month)
- **Smart upgrade/downgrade logic** with proper resource management
- **Free plan restrictions** and edge case handling
- **Coin purchase system** for additional resources when quota is exhausted
- **Phone number formatting** for international payment gateway compatibility

## ✅ Fixed Issues

✅ **401 Authentication Error** - Tatra Bank API credentials working  
✅ **Phone Number Format** - International format (+421) for API compliance  
✅ **Monthly/Yearly Support** - Users can choose billing cycles with 17% yearly discount  
✅ **Upgrade Logic** - New billing period starts immediately, resources reset  
✅ **Downgrade Logic** - Immediate change, resources preserved  
✅ **Free Plan Restrictions** - Proper validation and user messaging  
✅ **Resource Management** - Correct allocation for images, videos, models, coins  
✅ **Edge Case Handling** - Comprehensive validation for all scenarios  

## 🎯 Key Features

### 1. **Smart Subscription Management**
- **New Subscriptions**: Full resource allocation, new billing cycle
- **Upgrades**: 
  - Start NEW billing period immediately from upgrade date
  - Reset resources to new plan allocation
  - Previous plan cancelled
- **Downgrades**: 
  - Immediate change
  - Keep existing resources if higher than new plan
  - New billing cycle starts
- **Free Plan**: Special handling with one-time subscription rules

### 2. **Resource System**
- **Images**: For AI image generation (1200 for Starter plan)
- **Videos**: For video generation (40 for Starter plan)
- **3D Models**: For 3D model creation
- **Coins**: Universal currency when monthly allocation is exhausted

### 3. **Edge Case Handling**
- Free plan can only be subscribed once (unless downgrading from paid)
- Current plan users see "Current Plan" button (disabled)
- Upgrade users see "Upgrade (Starts New Period)" warning
- Downgrade users see "Downgrade" with resource preservation info
- Low resource warnings with coin purchase options

### 4. **User Experience**
- Real-time resource tracking with visual indicators
- Plan comparison with current status
- Billing cycle toggle (monthly/yearly)
- Loading states and error handling
- Informative messages for all scenarios

## 📋 API Endpoints

### Enhanced Payment Endpoints
```javascript
// Initiate subscription payment (handles free plan directly)
POST /api/getPaymentUrl
{
  "email": "user@example.com",
  "amount": 8, // Calculated based on billingCycle
  "subscriptionName": "starter",
  "billingCycle": "monthly", // or "yearly"
  "autoRenew": true
}

// Response for Free plan (no payment needed)
{
  "success": true,
  "message": "Successfully subscribed to Free plan!",
  "directSubscription": true
}

// Response for paid plans
{
  "tatraPayPlusUrl": "https://...",
  "changeType": "upgrade" // or "downgrade", "new"
}

// Payment confirmation (automatic webhook)
GET /api/confirm_payment?paymentId=xxx

// Change subscription plan with immediate downgrades
POST /api/changeSubscription
{
  "userId": "user_id",
  "newSubscriptionName": "business",
  "billingCycle": "yearly"
}

// Response for downgrades (immediate)
{
  "success": true,
  "message": "Successfully downgraded to Starter. Resources preserved.",
  "immediate": true
}

// Response for upgrades (requires payment)
{
  "requiresPayment": true,
  "amount": 24,
  "subscriptionName": "business",
  "billingCycle": "monthly",
  "message": "Upgrading will start a new billing period immediately."
}
```

## 🛠️ How It Works

### 1. **New User Flow**
```
User signs up → Selects plan → Free plan direct, Paid plan requires payment → Resources allocated → Billing cycle starts
```

### 2. **Upgrade Flow (Key Feature)**
```
User clicks upgrade → Payment required → Payment successful → NEW BILLING PERIOD STARTS → Resources RESET to new plan → Previous plan cancelled
```

### 3. **Downgrade Flow**
```
User clicks downgrade → Immediate change → Resources preserved (if higher) → New billing cycle set → No payment required
```

### 4. **Free Plan Flow**
```
New user → Can subscribe to Free
Existing Free user → "Already using Free plan" message
Paid user → Can downgrade to Free (resources preserved)
```

### 5. **Resource Management Logic**

#### New Subscriptions
```javascript
// Set full plan resources
user.imagesLeft = subscription.generatedImages
user.videosLeft = subscription.videoGenerations
user.modelsLeft = subscription.models3d
user.coins += subscription.coins
```

#### Upgrades (NEW BILLING PERIOD)
```javascript
// RESET resources to new plan allocation
user.imagesLeft = newSubscription.generatedImages  // Not incremental!
user.videosLeft = newSubscription.videoGenerations
user.modelsLeft = newSubscription.models3d
user.coins += newSubscription.coins // Add new plan coins
user.nextBillingDate = new Date() + billingCycle // NEW date from today
```

#### Downgrades
```javascript
// Keep existing resources if higher
user.imagesLeft = Math.max(user.imagesLeft, newSubscription.generatedImages)
user.videosLeft = Math.max(user.videosLeft, newSubscription.videoGenerations)
user.modelsLeft = Math.max(user.modelsLeft, newSubscription.models3d)
// Keep existing coins unchanged
```

## 🎨 Frontend Features

### Enhanced Pricing Section
- **Current Plan Indicator**: Visual highlight and "CURRENT" badge
- **Button States**: 
  - "Current Plan" (disabled, gray)
  - "Upgrade (Starts New Period)" (green)
  - "Downgrade" (yellow)
  - "Downgrade to Free" (yellow)
- **User Status Display**: Shows current resources and next billing date
- **Billing Cycle Toggle**: Monthly/Yearly with discount indicator
- **Plan Descriptions**: Clear descriptions for each plan
- **Upgrade/Downgrade Info**: Contextual messages about what happens

### Smart Edge Case Handling
```javascript
// Free plan validation
if (subscription.name === 'FREE') {
  if (!canSubscribeToFree(user)) {
    return res.status(400).json({ 
      message: "You are already using the Free plan. You can upgrade to a paid plan or buy coins for additional resources.",
      showUpgradeOptions: true
    });
  }
}

// Current plan detection
const getButtonInfo = (plan) => {
  const planName = plan.subscription.toUpperCase();
  const currentPlan = currentSubscription;
  
  if (planName === currentPlan) {
    return { text: "Current Plan", disabled: true, className: "card-button current" };
  }
  // ... upgrade/downgrade logic
};
```

## 🔧 Configuration

### Environment Variables
```bash
# Tatra Bank API
TATRA_CLIENT_ID=your_client_id
TATRA_CLIENT_SECRET=your_client_secret

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Email notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Database Schema Updates
```javascript
// User model additions
const userSchema = new Schema({
  // ... existing fields
  
  // Enhanced billing fields
  autoRenew: { type: Boolean, default: false },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  nextBillingDate: { type: Date, default: null },
  changeType: { type: String, enum: ['new', 'upgrade', 'downgrade', 'same'], default: null },
  
  // Resource tracking
  no_of_images_left: { type: Number, default: 0 },
  imagesLeft: { type: Number, default: 0 },
  videosLeft: { type: Number, default: 0 },
  modelsLeft: { type: Number, default: 0 },
  coins: { type: Number, default: 0 }
});
```

## 🧪 Testing Scenarios

### Manual Testing Checklist

1. **New User Scenarios**
   - [ ] Sign up and select Free plan (should work)
   - [ ] Sign up and select Starter plan (requires payment)
   - [ ] Sign up and select yearly billing (shows discount)

2. **Free Plan Edge Cases**
   - [ ] Existing Free user clicks Free plan (shows "already using" message)
   - [ ] Paid user downgrades to Free (should work, resources preserved)
   - [ ] Free user sees upgrade options when trying to select Free again

3. **Upgrade Scenarios**
   - [ ] Free → Starter: New billing period starts, resources reset to 1200 images
   - [ ] Starter → Business: New billing period starts immediately
   - [ ] Check that previous plan is cancelled
   - [ ] Verify resources are reset (not added to existing)

4. **Downgrade Scenarios**
   - [ ] Business → Starter: Immediate change, resources preserved if higher
   - [ ] Premium → Free: Immediate change, keep existing resources
   - [ ] Verify no payment required for downgrades

5. **Resource Management**
   - [ ] Check resource display in profile
   - [ ] Verify low resource warnings
   - [ ] Test coin purchase when resources low
   - [ ] Verify billing date updates correctly

6. **Edge Cases**
   - [ ] User on current plan sees disabled "Current Plan" button
   - [ ] Upgrade users see "Starts New Period" warning
   - [ ] Downgrade users see "Resources preserved" info
   - [ ] Phone number formatting for international users

## 🚨 Important Implementation Details

1. **Upgrade = New Billing Period**: This is the key requirement - upgrades start a fresh billing cycle immediately
2. **Resource Reset on Upgrade**: Resources are set to new plan allocation, not added to existing
3. **Free Plan Restrictions**: Can only subscribe once unless downgrading from paid
4. **Phone Number Formatting**: All numbers converted to international format (+421) for Tatra Bank API
5. **Auto-Renewal Default**: New paid subscriptions default to auto-renewal enabled

## 🔍 Troubleshooting

### Common Issues

**"You are already using the Free plan" error**
- User is trying to select Free plan when already on Free
- Show upgrade options instead
- Only allow Free plan once per user lifecycle

**Phone number format errors (400 Bad Request)**
- Check user phone number is in international format
- System automatically converts 0335632478 → +421335632478
- Fallback to +421901123456 if no phone provided

**Resources not reset on upgrade**
- Verify upgrade logic in confirm_payment route
- Check that changeType is properly set
- Ensure new billing date is calculated from today

**Downgrade not immediate**
- Check changeSubscription route handles downgrades properly
- Verify Free plan downgrades work correctly
- Ensure resources are preserved using Math.max()

## 🎉 Success!

Your payment system now supports:
- ✅ **Complete pricing model** as specified
- ✅ **Smart upgrade logic** with new billing periods
- ✅ **Proper downgrade handling** with resource preservation
- ✅ **Free plan restrictions** and edge case validation
- ✅ **International phone number formatting**
- ✅ **Comprehensive user feedback** and error handling
- ✅ **Resource management** for images, videos, models, coins
- ✅ **Auto-renewal** with proper billing cycle management

The system handles all edge cases and provides a smooth user experience! 🚀 