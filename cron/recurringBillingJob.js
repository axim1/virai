// cron/recurringBillingJob.js
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { User, Subscription } = require("../models");

const BASE_URL = process.env.BASE_URL || "http://virtuartai.com";
const TATRA_AUTH_URL = "https://api.tatrabanka.sk/tatrapayplus/sandbox/auth/oauth/v2/token";
const TATRA_PAYMENT_URL = "https://api.tatrabanka.sk/tatrapayplus/sandbox/v1/payments";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

cron.schedule("0 4 * * *", async () => {
  console.log("[CRON] Checking recurring subscriptions...");

  const today = new Date();

  const users = await User.find({
    autoRenew: true,
    nextBillingDate: { $lte: today },
    paymentStatus: "COMPLETED",
    subscription: { $ne: null },
  }).populate("subscription");

  for (const user of users) {
    const sub = user.subscription;
    const amount = user.billingCycle === "yearly" ? sub.priceYearly : sub.priceMonthly;

    try {
      const tokenResponse = await axios.post(
        TATRA_AUTH_URL,
        new URLSearchParams({
          client_id: process.env.TATRA_CLIENT_ID,
          client_secret: process.env.TATRA_CLIENT_SECRET,
          grant_type: "client_credentials",
          scope: "TATRAPAYPLUS",
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const accessToken = tokenResponse.data.access_token;

      // Format phone number for API
      const formattedPhone = formatPhoneNumber(user.phone);

      const paymentResponse = await axios.post(
        TATRA_PAYMENT_URL,
        {
          basePayment: {
            instructedAmount: { amountValue: amount, currency: "EUR" },
            endToEnd: { variableSymbol: "1", specificSymbol: "2", constantSymbol: "3" },
          },
          userData: {
            firstName: user.fname,
            lastName: user.lname,
            email: user.email,
            externalApplicantId: "1111",
            phone: formattedPhone,
          },
          cardDetail: {
            cardHolder: `${user.fname} ${user.lname}`,
            isPreAuthorization: false,
          },
        },
        {
          headers: {
            "X-Request-ID": uuidv4(),
            "IP-Address": "136.226.198.81",
            "Redirect-URI": `${BASE_URL}/api/confirm_payment?billingCycle=${user.billingCycle}&autoRenew=true`,
            "Preferred-Method": "CARD_PAY",
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const { tatraPayPlusUrl, paymentId } = paymentResponse.data;

      await User.findByIdAndUpdate(user._id, {
        paymentId,
        paymentStatus: "PENDING",
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Subscription Renewal Payment Required",
        html: `
          <h3>Hi ${user.fname},</h3>
          <p>Your ${user.billingCycle} subscription is due. Please complete your payment:</p>
          <a href="${tatraPayPlusUrl}" target="_blank">Click here to pay</a>
          <p>Thanks,<br/>VirtuartAI Team</p>
        `,
      });

      console.log(`🔁 Payment email sent to ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed for ${user.email}:`, error.message);
    }
  }
});