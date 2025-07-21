const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { User, Subscription } = require('../models');

const router = express.Router();

// Your client credentials from .env
const clientId = process.env.TATRA_CLIENT_ID;
const clientSecret = process.env.TATRA_CLIENT_SECRET;
// POST /api/getPaymentUrl
router.post('/getPaymentUrl', async (req, res) => {
    try {
        // const { email, amount, subscriptionName } = req.body;
        const { email, amount, subscriptionName, autoRenew, billingCycle } = req.body;

        const user = await User.findOne({ email });
        const subscription = await Subscription.findOne({ name: subscriptionName.toUpperCase() });

        if (!user) return res.status(404).json({ message: "User not found." });
        if (!subscription) return res.status(404).json({ message: "Requested subscription not found." });

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

        // Initiate payment
        const paymentResponse = await axios.post(
            'https://api.tatrabanka.sk/tatrapayplus/sandbox/v1/payments',
            {
                basePayment: {
                    instructedAmount: {
                        amountValue: amount,
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
                    phone: '+421901123456',
                },
                bankTransfer: {
                    remittanceInformationUnstructured: 'the message',
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
                    'Redirect-URI': 'http://virtuartai.com/confirm_payment',
                    'Preferred-Method': 'CARD_PAY',
                    'Accept-Language': 'en',
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const { tatraPayPlusUrl, paymentId } = paymentResponse.data;

        await User.findByIdAndUpdate(user._id, {
            paymentId,
            paymentStatus: 'PENDING',
            requestedSubscription: subscription._id,
            autoRenew,
            billingCycle
        });

        res.json({ tatraPayPlusUrl });
    } catch (error) {
        console.error('Error in getPaymentUrl:', error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// GET /api/confirm_payment
router.get('/confirm_payment', async (req, res) => {
    try {
        const { paymentId, autoRenew, billingCycle } = req.query;

        if (!paymentId) {
            return res.status(400).json({ message: "Missing paymentId query parameter." });
        }

        if (error && errorId) {
            console.error(`Technical error occurred: ${error} (Error ID: ${errorId})`);
            await User.findOneAndUpdate({ paymentId }, { paymentStatus: 'FAILED' });
            return res.status(500).json({
                message: "Payment processing encountered a technical error.",
                error,
                errorId,
            });
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
            const newSub = user.requestedSubscription;

            const isUpgrade = !user.subscription || newSub.priceMonthly > user.subscription?.priceMonthly;

            const updateFields = {
                subscription: newSub._id,
                subscription_date: new Date(),
                paymentStatus: 'COMPLETED',
                requestedSubscription: null,
                autoRenew: autoRenew === 'true',
                billingCycle: billingCycle || 'monthly',
                nextBillingDate: (() => {
                    const next = new Date();
                    if (billingCycle === 'yearly') next.setFullYear(next.getFullYear() + 1);
                    else next.setMonth(next.getMonth() + 1);
                    return next;
                })()
            };

            if (isUpgrade) {
                updateFields.$inc = {
                    imagesLeft: newSub.generatedImages,
                    videosLeft: newSub.videoGenerations,
                    modelsLeft: newSub.models3d,
                    coins: newSub.coins,
                };
            }

            await User.findByIdAndUpdate(user._id, updateFields);
            return res.redirect(`http://virtuartai.com/?status=success&user=${user._id}`);
            //   const user = await User.findOne({ paymentId }).populate('requestedSubscription');

            //   if (!user || !user.requestedSubscription) {
            //     return res.status(404).json({ message: "User or requested subscription not found." });
            //   }

            //   const subscription = await Subscription.findById(user.requestedSubscription._id);

            //   await User.findByIdAndUpdate(user._id, {
            //     no_of_images_left: user.no_of_images_left + subscription.generatedImages,
            //     subscription: subscription._id,
            //     paymentStatus: 'COMPLETED',
            //     subscription_date: new Date(),
            //     requestedSubscription: null,
            //   });

            //   return res.redirect(`http://virtuartai.com/?status=success&user=${user._id}`);
        } else {
            await User.findOneAndUpdate({ paymentId }, { paymentStatus: 'FAILED' });
            return res.redirect(`http://virtuartai.com/?status=failed&authorizationStatus=${authorizationStatus}`);
        }
    } catch (error) {
        console.error("Error in confirm_payment:", error.message);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
});

module.exports = router;



router.post('/buyCoins', async (req, res) => {
    const { email, amount, coinAmount } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

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
                phone: '+421901123456',
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
                'Redirect-URI': `http://virtuartai.com/confirm_coin_purchase?email=${user.email}&coinAmount=${coinAmount}`,
                'Preferred-Method': 'CARD_PAY',
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );

    const { tatraPayPlusUrl } = paymentResponse.data;
    res.json({ tatraPayPlusUrl });
});




router.get('/confirm_coin_purchase', async (req, res) => {
    const { paymentId, email, coinAmount, error } = req.query;
    if (error) return res.redirect(`http://virtuartai.com/?status=coin_failed`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

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

        return res.redirect(`http://virtuartai.com/?status=coin_success`);
    } else {
        return res.redirect(`http://virtuartai.com/?status=coin_failed`);
    }
});
router.post('/updateAutoRenew', async (req, res) => {
  try {
    const { userId, autoRenew } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { autoRenew, nextBillingDate: autoRenew ? new Date() : null },
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