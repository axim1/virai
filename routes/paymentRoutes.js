const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { User, Subscription } = require('../models');
require('dotenv').config();

const router = express.Router();

// Your client credentials from .env
const clientId = process.env.TATRA_CLIENT_ID;
const clientSecret = process.env.TATRA_CLIENT_SECRET;
console.log('tatrabanka: ',clientId, clientSecret);

// Helper function to format phone number for Tatra Bank API
function formatPhoneNumber(phone) {
  if (!phone) return '+421901123456'; // Default Slovak number
  
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If it starts with 0, assume it's Slovak and replace with +421
  if (cleanPhone.startsWith('0')) {
    return '+421' + cleanPhone.substring(1);
  }
  
  // If it doesn't start with +, add +421 prefix
  if (!phone.startsWith('+')) {
    return '+421' + cleanPhone;
  }
  
  return phone; // Already in correct format
}

// Helper function to determine subscription change type
function getSubscriptionChangeType(currentSub, newSub) {
  if (!currentSub) return 'new';
  
  // Handle renew case (same plan)
  if (currentSub.name === newSub.name) return 'renew';
  
  // Free plan comparison
  if (currentSub.name === 'FREE' && newSub.name !== 'FREE') return 'upgrade';
  if (currentSub.name !== 'FREE' && newSub.name === 'FREE') return 'downgrade';
  if (currentSub.name === 'FREE' && newSub.name === 'FREE') return 'same';
  
  // Compare monthly prices for paid plans
  const currentPrice = currentSub.priceMonthly;
  const newPrice = newSub.priceMonthly;
  
  if (currentPrice < newPrice) return 'upgrade';
  if (currentPrice > newPrice) return 'downgrade';
  return 'same';
}

// Helper function to calculate next billing date from today
function calculateNextBillingDate(billingCycle) {
  const nextDate = new Date();
  if (billingCycle === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }
  return nextDate;
}

// Helper function to check if user can subscribe to free plan
function canSubscribeToFree(user) {
  // If user never had a subscription, they can get free
  if (!user.subscription) return true;
  
  // If user is currently on free, they can't subscribe again
  if (user.subscription.name === 'FREE') return false;
  
  // If user had paid plans before, they can downgrade to free
  return true;
}

// POST /api/getPaymentUrl
router.post('/getPaymentUrl', async (req, res) => {
    try {
        const { email, amount, subscriptionName, billingCycle = 'monthly', autoRenew = true, changeType } = req.body;
        console.log('Processing payment:', { email, amount, subscriptionName, billingCycle, changeType });

        const user = await User.findOne({ email }).populate('subscription');
        const subscription = await Subscription.findOne({ name: subscriptionName.toUpperCase() });

        if (!user) return res.status(404).json({ message: "User not found." });
        if (!subscription) return res.status(404).json({ message: "Requested subscription not found." });

        // Handle FREE plan special cases
        if (subscription.name === 'FREE') {
            if (!canSubscribeToFree(user)) {
                return res.status(400).json({ 
                    message: "You are already using the Free plan. You can upgrade to a paid plan or buy coins for additional resources.",
                    showUpgradeOptions: true
                });
            }
            
            // For free plan, no payment needed - direct subscription
            await User.findByIdAndUpdate(user._id, {
                subscription: subscription._id,
                subscriptionDate: new Date(),
                billingCycle: 'monthly',
                autoRenew: false,
                nextBillingDate: null,
                // Set free plan resources
                no_of_images_left: subscription.generatedImages || 0,
                imagesLeft: subscription.generatedImages || 0,
                videosLeft: subscription.videoGenerations || 0,
                modelsLeft: subscription.models3d || 0,
                coins: user.coins || 0, // Keep existing coins
            });

            return res.json({ 
                success: true, 
                message: "Successfully subscribed to Free plan!",
                directSubscription: true 
            });
        }

        // Calculate actual amount based on billing cycle
        const actualAmount = billingCycle === 'yearly' ? subscription.priceYearly : subscription.priceMonthly;
        
        // Determine change type if not provided by frontend
        const finalChangeType = changeType || getSubscriptionChangeType(user.subscription, subscription);
        console.log(`Change type: ${finalChangeType}`);

        // Get access token
        const tokenResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/auth/oauth/v2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
                scope: 'TATRAPAYPLUS',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Format phone number for API
        const formattedPhone = formatPhoneNumber(user.phone);
        console.log(`Formatted phone: ${user.phone} -> ${formattedPhone}`);

        // Initiate payment
        const paymentResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/v1/payments',
            {
                basePayment: {
                    instructedAmount: {
                        amountValue: actualAmount,
                        currency: 'EUR',
                    },
                    endToEnd: {
                        variableSymbol: '1',
                        specificSymbol: '2',
                        constantSymbol: '3',
                    },
                },
                userData: {
                    firstName: user.fname,
                    lastName: user.lname,
                    email: user.email,
                    externalApplicantId: '1111',
                    phone: formattedPhone,
                },
                bankTransfer: {
                    remittanceInformationUnstructured: `${subscription.name} subscription - ${billingCycle} - ${finalChangeType}`,
                },
                cardDetail: {
                    cardHolder: `${user.fname} ${user.lname}`,
                    isPreAuthorization: false,
                },
            },
            {
                headers: {
                    'X-Request-ID': uuidv4(),
                    'IP-Address': '136.226.198.81',
                    // 'Redirect-URI': `${process.env.BACKEND_URL || 'http://virtuartai.com'}/api/confirm_payment`,
                    'Redirect-URI': 'http://virtuartai.com/api/confirm_payment',
                    'Preferred-Method': 'CARD_PAY',
                    'Accept-Language': 'en',
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { tatraPayPlusUrl, paymentId } = paymentResponse.data;

        // Update user with payment details
        await User.findByIdAndUpdate(user._id, {
            paymentId,
            paymentStatus: 'PENDING',
            requestedSubscription: subscription._id,
            autoRenew,
            billingCycle,
            changeType: finalChangeType, // Store for later processing
        });

        res.json({ tatraPayPlusUrl, changeType: finalChangeType });
    } catch (error) {
        console.error('Error in getPaymentUrl:', error.response?.data || error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// GET /api/confirm_payment
router.get('/confirm_payment', async (req, res) => {
    try {
        const { paymentId, error, errorId } = req.query;

        if (!paymentId) {
            return res.status(400).json({ message: "Missing paymentId query parameter." });
        }

        if (error && errorId) {
            console.error(`Technical error occurred: ${error} (Error ID: ${errorId})`);
            await User.findOneAndUpdate({ paymentId }, { paymentStatus: 'FAILED' });
            return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=failed&error=${encodeURIComponent(error)}`);
        }

        // Get access token
        const tokenResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/auth/oauth/v2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
                scope: 'TATRAPAYPLUS',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Check payment status
        const paymentStatusResponse = await axios.get(
            `https://api.tatrabanka.sk/tatrapayplus/sandbox/v1/payments/${paymentId}/status`,
            {
                headers: {
                    'X-Request-ID': uuidv4(),
                    'IP-Address': '136.226.198.81',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { authorizationStatus } = paymentStatusResponse.data;

        if (authorizationStatus === "PAY_METHOD_SELECTED") {
            const user = await User.findOne({ paymentId }).populate('requestedSubscription subscription');

            if (!user || !user.requestedSubscription) {
                return res.status(404).json({ message: "User or requested subscription not found." });
            }

            const newSub = user.requestedSubscription;
            const changeType = user.changeType || 'new';

            // Calculate new billing date - IMPORTANT: For upgrades and renewals, start new period immediately
            const newBillingDate = calculateNextBillingDate(user.billingCycle || 'monthly');

            let updateFields = {
                subscription: newSub._id,
                paymentStatus: 'COMPLETED',
                subscription_date: new Date(), // Update subscription date
                requestedSubscription: null,
                autoRenew: user.autoRenew || true, // Default to auto-renew for paid plans
                billingCycle: user.billingCycle || 'monthly',
                nextBillingDate: newBillingDate, // Always set new billing date
                changeType: null, // Clear temporary field
            };

            if (changeType === 'upgrade') {
                // UPGRADE: New billing period starts NOW, reset resources to new plan allocation
                updateFields = {
                    ...updateFields,
                    no_of_images_left: newSub.generatedImages || 0, // Reset to new plan allocation
                    imagesLeft: newSub.generatedImages || 0,
                    videosLeft: newSub.videoGenerations || 0,
                    modelsLeft: newSub.models3d || 0,
                    // Keep existing coins and add new plan coins
                    $inc: { coins: newSub.coins || 0 }
                };
                console.log(`✅ UPGRADE: New billing period started, resources reset to ${newSub.name} allocation`);
            } else if (changeType === 'renew') {
                // RENEW: New billing period starts NOW, ADD resources to existing allocation
                updateFields = {
                    ...updateFields,
                    $inc: {
                        no_of_images_left: newSub.generatedImages || 0, // Add to existing resources
                        imagesLeft: newSub.generatedImages || 0,
                        videosLeft: newSub.videoGenerations || 0,
                        modelsLeft: newSub.models3d || 0,
                        coins: newSub.coins || 0
                    }
                };
                console.log(`✅ RENEW: New billing period started, resources added to existing ${newSub.name} allocation`);
            } else if (changeType === 'downgrade') {
                // DOWNGRADE: Keep existing resources if higher, set new billing cycle
                updateFields = {
                    ...updateFields,
                    no_of_images_left: Math.max(user.no_of_images_left || 0, newSub.generatedImages || 0),
                    imagesLeft: Math.max(user.imagesLeft || 0, newSub.generatedImages || 0),
                    videosLeft: Math.max(user.videosLeft || 0, newSub.videoGenerations || 0),
                    modelsLeft: Math.max(user.modelsLeft || 0, newSub.models3d || 0),
                    // Keep existing coins
                };
                console.log(`✅ DOWNGRADE: Resources preserved, new billing cycle set`);
            } else {
                // NEW SUBSCRIPTION: Set full resources
                updateFields = {
                    ...updateFields,
                    no_of_images_left: newSub.generatedImages || 0,
                    imagesLeft: newSub.generatedImages || 0,
                    videosLeft: newSub.videoGenerations || 0,
                    modelsLeft: newSub.models3d || 0,
                    $inc: { coins: newSub.coins || 0 }
                };
                console.log(`✅ NEW SUBSCRIPTION: Full resources allocated for ${newSub.name}`);
            }

            await User.findByIdAndUpdate(user._id, updateFields);

            console.log(`✅ Payment completed: ${changeType} to ${newSub.name}, next billing: ${newBillingDate.toDateString()}`);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=success&user=${user._id}&type=${changeType}`);
        } else {
            await User.findOneAndUpdate({ paymentId }, { paymentStatus: 'FAILED' });
            return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=failed&reason=${authorizationStatus}`);
        }
    } catch (error) {
        console.error("Error in confirm_payment:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

// POST /api/changeSubscription - For immediate plan changes
router.post('/changeSubscription', async (req, res) => {
    try {
        const { userId, newSubscriptionName, billingCycle = 'monthly' } = req.body;

        const user = await User.findById(userId).populate('subscription');
        const newSubscription = await Subscription.findOne({ name: newSubscriptionName.toUpperCase() });

        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!newSubscription) return res.status(404).json({ message: 'Subscription not found' });

        const changeType = getSubscriptionChangeType(user.subscription, newSubscription);
        
        if (changeType === 'same') {
            return res.json({ 
                message: 'You are already on this subscription plan',
                canChangeBillingCycle: user.billingCycle !== billingCycle
            });
        }

        // Handle renew case - allow user to buy the same plan again
        if (changeType === 'renew') {
            const amount = billingCycle === 'yearly' ? newSubscription.priceYearly : newSubscription.priceMonthly;
            
            return res.json({
                requiresPayment: true,
                amount,
                subscriptionName: newSubscription.name,
                billingCycle,
                changeType: 'renew',
                message: `Renewing ${newSubscription.name} will start a new ${billingCycle} billing period and add resources to your existing quota.`
            });
        }

        // Handle FREE plan requests
        if (newSubscription.name === 'FREE') {
            if (!canSubscribeToFree(user)) {
                return res.status(400).json({ 
                    message: "You are already using the Free plan or cannot downgrade to Free at this time.",
                    showUpgradeOptions: true
                });
            }

            // Immediate downgrade to free
            await User.findByIdAndUpdate(userId, {
                subscription: newSubscription._id,
                billingCycle: 'monthly',
                autoRenew: false,
                nextBillingDate: null,
                subscription_date: new Date(),
                // Keep existing resources if higher than free plan
                no_of_images_left: Math.max(user.no_of_images_left || 0, newSubscription.generatedImages || 0),
                imagesLeft: Math.max(user.imagesLeft || 0, newSubscription.generatedImages || 0),
                videosLeft: Math.max(user.videosLeft || 0, newSubscription.videoGenerations || 0),
                modelsLeft: Math.max(user.modelsLeft || 0, newSubscription.models3d || 0),
                // Keep existing coins
            });

            return res.json({ 
                success: true, 
                message: 'Successfully downgraded to Free plan. Your existing resources have been preserved.',
                immediate: true 
            });
        }

        // For downgrades to paid plans, apply immediately
        if (changeType === 'downgrade') {
            await User.findByIdAndUpdate(userId, {
                subscription: newSubscription._id,
                billingCycle,
                nextBillingDate: calculateNextBillingDate(billingCycle),
                subscription_date: new Date(),
                // Keep existing resources if they're higher than new subscription limits
                no_of_images_left: Math.max(user.no_of_images_left || 0, newSubscription.generatedImages || 0),
                imagesLeft: Math.max(user.imagesLeft || 0, newSubscription.generatedImages || 0),
                videosLeft: Math.max(user.videosLeft || 0, newSubscription.videoGenerations || 0),
                modelsLeft: Math.max(user.modelsLeft || 0, newSubscription.models3d || 0),
                // Keep existing coins
            });

            return res.json({ 
                success: true, 
                message: `Successfully downgraded to ${newSubscription.name}. Your existing resources have been preserved.`,
                immediate: true 
            });
        }

        // For upgrades, require payment and start new billing period
        const amount = billingCycle === 'yearly' ? newSubscription.priceYearly : newSubscription.priceMonthly;
        
        return res.json({
            requiresPayment: true,
            amount,
            subscriptionName: newSubscription.name,
            billingCycle,
            changeType: 'upgrade',
            message: `Upgrading to ${newSubscription.name} will start a new ${billingCycle} billing period immediately and reset your resource allocation.`
        });

    } catch (error) {
        console.error('Error changing subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/buyCoins
router.post('/buyCoins', async (req, res) => {
    try {
        const { email, amount, coinAmount } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get access token
        const tokenResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/auth/oauth/v2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
                scope: 'TATRAPAYPLUS',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Format phone number for API
        const formattedPhone = formatPhoneNumber(user.phone);

        const paymentResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/v1/payments',
            {
                basePayment: {
                    instructedAmount: { amountValue: amount, currency: 'EUR' },
                    endToEnd: { variableSymbol: '1', specificSymbol: '2', constantSymbol: '3' },
                },
                userData: {
                    firstName: user.fname,
                    lastName: user.lname,
                    email: user.email,
                    externalApplicantId: '1111',
                    phone: formattedPhone,
                },
                bankTransfer: {
                    remittanceInformationUnstructured: `${coinAmount} coins purchase`,
                },
                cardDetail: {
                    cardHolder: `${user.fname} ${user.lname}`,
                    isPreAuthorization: false,
                },
            },
            {
                headers: {
                    'X-Request-ID': uuidv4(),
                    'IP-Address': '136.226.198.81',
                    'Redirect-URI': `${process.env.BACKEND_URL || 'http://virtuartai.com'}/api/confirm_coin_purchase?email=${user.email}&coinAmount=${coinAmount}`,
                    'Preferred-Method': 'CARD_PAY',
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { tatraPayPlusUrl } = paymentResponse.data;
        res.json({ tatraPayPlusUrl });
    } catch (error) {
        console.error('Error buying coins:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/confirm_coin_purchase', async (req, res) => {
    try {
        const { paymentId, email, coinAmount, error } = req.query;
        
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=coin_failed`);
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("User not found");

        // Get access token
        const tokenResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/auth/oauth/v2/token',
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials',
                scope: 'TATRAPAYPLUS',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        const paymentStatusResponse = await axios.get(
            `https://api.tatrabanka.sk/tatrapayplus/sandbox/v1/payments/${paymentId}/status`,
            {
                headers: {
                    'X-Request-ID': uuidv4(),
                    'IP-Address': '136.226.198.81',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { authorizationStatus } = paymentStatusResponse.data;

        if (authorizationStatus === "PAY_METHOD_SELECTED") {
            await User.findByIdAndUpdate(user._id, {
                $inc: { coins: parseInt(coinAmount) }
            });

            return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=coin_success`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=coin_failed`);
        }
    } catch (error) {
        console.error('Error confirming coin purchase:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://virtuartai.com'}/?status=coin_failed`);
    }
});

router.post('/updateAutoRenew', async (req, res) => {
    try {
        const { userId, autoRenew } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                autoRenew, 
                nextBillingDate: autoRenew ? calculateNextBillingDate('monthly') : null 
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating autoRenew:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;