const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const path = require('path');
const { User, Subscription, GeneratedImage } = require('./models');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const FormData = require('form-data');
require('dotenv').config();
const callbackUrl = process.env.CALLBACK_URL;
const { v4: uuidv4 } = require('uuid'); // Import UUID
// const multer = require("multer");
// const path = require("path");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const fs = require('fs');

const uri = "mongodb+srv://asim6832475:1234@cluster0.ukza83p.mongodb.net/?retryWrites=true&w=majority";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
    // First API call to get the access token
const clientId = 'l77443c07411ca4cfbbaf5498a11dfadde';
const clientSecret = 'daeb8027bc5e4e61a890550c10cf4cb7';

mongoose.connect(uri, clientOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Error connecting to MongoDB:", error));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
// const upload = multer({ storage });

app.get("/subscriptions", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.send({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

// Example of updating a route to use Mongoose syntax
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      if (password === user.password) {
        res.status(200).send({ message: "Login successfully", user: user });
      } else {
        console.log("Wrong password");
        res.status(401).send({ message: "Invalid email or password" });
      }
    } else {
      console.log("User not found");
      res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});




app.post("/api/signup", upload.single("profilePic"), async (req, res) => {
  const { fname, lname, email, password, phone, subscriptionName } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send({ message: "User is already registered" });
    }

    const subscription = await Subscription.findOne({ name: subscriptionName });
    if (!subscription) {
      return res.send({ message: "Invalid subscription package" });
    }

    const profilePicPath = req.file ? req.file.path : null;

    const newUser = await User.create({
      fname,
      lname,
      email,
      password,
      phone,
      no_of_images_left: subscription.generatedImages,
      subscribed_monthly: ["STARTER", "BUSINESS", "PREMIUM"].includes(subscriptionName),
      subscribed_yearly: ["BUSINESS", "PREMIUM"].includes(subscriptionName),
      subscription: subscription._id,
      profilePic: profilePicPath,
    });

    res.send({ message: "Account created! Please login.", user: newUser });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});


// const { v4: uuidv4 } = require('uuid');

app.post('/api/getPaymentUrl', async (req, res) => {
  try {
    const { email, amount, subscriptionName } = req.body;
    console.log(email, amount, subscriptionName)
    // Find the user and requested subscription
    const user = await User.findOne({ email: email });
    const subscription = await Subscription.findOne({ name: subscriptionName.toUpperCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!subscription) {
      return res.status(404).json({ message: "Requested subscription not found." });
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
          'Redirect-URI': 'http://92.240.254.103:8000/confirm_payment',
          'Preferred-Method': 'CARD_PAY',
          'Accept-Language': 'en',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { tatraPayPlusUrl, paymentId } = paymentResponse.data;

     console.log(tatraPayPlusUrl)
   // Update user with paymentId, requested subscription, and pending status
    await User.findByIdAndUpdate(user._id, {
      paymentId: paymentId,
      paymentStatus: 'PENDING',
      requestedSubscription: subscription._id,
    });
    res.json({ tatraPayPlusUrl });
  } catch (error) {
    console.error('Error in getPaymentUrl:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});



app.get("/confirm_payment", async (req, res) => {
  try {
    const { paymentId, paymentMethod, error, errorId } = req.query;

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
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const { authorizationStatus } = paymentStatusResponse.data;

    if (authorizationStatus === "PAY_METHOD_SELECTED") {
      const user = await User.findOne({ paymentId }).populate('requestedSubscription');

      if (!user || !user.requestedSubscription) {
        return res.status(404).json({ message: "User or requested subscription not found." });
      }
      const subscription = await Subscription.findOne({ _id: user.requestedSubscription._id });
      console.log(subscription)
      // Update user subscription
      await User.findByIdAndUpdate(user._id, {
        no_of_images_left:user.no_of_images_left + subscription.generatedImages,
        subscription: subscription._id,
        paymentStatus: 'COMPLETED',
        subscription_date: new Date(),
        requestedSubscription: null,
      });

      return res.redirect(`http://92.240.254.103:8000/?status=success&user=${user._id}`);
    } else {
      await User.findOneAndUpdate({ paymentId }, { paymentStatus: 'FAILED' });
      return res.redirect(`http://92.240.254.103:8000/?status=failed&authorizationStatus=${authorizationStatus}`);
    }
  } catch (error) {
    console.error("Error in confirm_payment:", error.message);
    res.status(500).json({ message: "Internal server error.", error: error.message });
  }
});






let imageResults;
let respData;
// https://ek6vmxx07wvmnf-8000.proxy.runpod.net/docs
app.post('/image-callback', async (req, res) => {
  try {
    console.log("callback called")
    const imageUuid = req.body.uuid;
    // console.log("uuid :", imageUuid)
    const response = await axios.get(`https://ek6vmxx07wvmnf-8000.proxy.runpod.net/getimage/${imageUuid}`, {
      params: {
        delete: true,
        type: 'PNG',
        base64_c: false,
        quality_level: 90,
      },
      headers: {
        'accept': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    // console.log(response.data)
    respData = response.data
    // Store the generated image in the database
    // const generatedImage = new GeneratedImage({
    //   userId: userId,
    //   image: response.data // Assuming the image is stored as binary data
    // });
    // await generatedImage.save();
    // Convert binary data to base64 string if needed
    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    imageResults = imageDataUrl; // Store the result
    // console.log("image results::",imageResults[imageUuid])
    // res.send({ imageUrls: imageDataUrl });
    res.status(200).send({ message: 'Image processed successfully' });
  } catch (error) {
    console.error('Error handling image callback:', error);
    res.status(500).send({ message: 'Error handling image callback' });
  }
});

app.get('/check-image-status/:userId/:uuid', async (req, res) => {
  const { uuid, userId } = req.params;
  // console.log("checking status for :::", uuid, userId)
  if (imageResults) {
    console.log("checking status for")

    // res.json(imageResults[uuid]);
    const generatedImage = new GeneratedImage({
      userId: userId,
      image: respData
    });
    await generatedImage.save();


    res.status(200).send({ imageUrls: imageResults });

     respData='';
     imageResults=''; // Clean up after sending
    if (!imageResults) {
      console.log("deleted image results :::")
    }

  } else {
    res.status(202).send({ message: 'Processing' }); // 202 Accepted - processing not complete
  }
});


app.post('/sketch-to-image', upload.single('sketch_image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: 'No sketch image provided' });
    }
    // const sketchImagePath = req.file.path; // Path to the uploaded sketch image

    const sketchImagePath = req.file.path; // Path to the uploaded sketch image
    const form = new FormData();

    console.log(req.body.prompt); // Should log "cat"
    console.log( "model xl :: ",req.body.strength, req.body.styleType);
    // Append parameters to form data
    if (!req.file) {
      return res.status(400).send({ message: 'No sketch image provided' });
    }
    const userId = req.body.userId; // Assuming the userId is sent in the body of the request
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      console.log("User not found. UserId:", userId);
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user has any image generation limits left
    if (user.no_of_images_left <= 0) {
      return res.status(400).send({ message: "You have reached the image generation limit" });
    }

    // Decrement the user's image generation limit
    const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } }, { new: true });
    if (!updatedUser) {
      console.log("Error updating user:", updatedUser);
      return res.status(500).send({ message: "Error updating user" });
    }


    // Append text fields
    form.append('strength', '0.8');
    form.append('guidance_scale', '7.5');
    form.append('prompt', req.body.prompt || 'high quality interior'); // Use the prompt from the request or a default value
    form.append('width', req.body.width || '512');
    form.append('height', req.body.height || '512');
    form.append('steps', '25');
    form.append('safetensor', 'false');
    form.append('model_xl', req.body.model_xl||'false');
    form.append('negative_prompt', req.body.negativePrompt || 'bad, blurry, low quality, low resolution, deformed'); // Long string as in the example
    form.append('clip_skip', '0');
    form.append('num_images', '1');
    form.append('style', req.body.styleType || 'default');
    form.append('seed', ''); // Empty string or any specific value if needed
    form.append('sketch_image_uuid', '456'); // Example UUID, replace with actual if available
    form.append('revert_extra', ''); // Empty string or any specific value if needed
    // form.append('callback_url', ''); // Empty string or any specific value if needed
    form.append('maintain_aspect_ratio', req.body.maintainAspectRatio || 'false');
    form.append('scheduler', 'Default');
    form.append("strength", req.body.strength);

    // Append the file
    form.append('sketch_image', fs.createReadStream(sketchImagePath), req.file.originalname);
    // Assuming your application's host and port are configured correctly
    const callbackUrlImg = `${callbackUrl}/image-callback`; // Replace with your actual callback endpoint URL
    // form.append('callback_url', callbackUrlImg);
    try {
      sketch2imageResponse = await axios.post('https://ek6vmxx07wvmnf-8000.proxy.runpod.net/sketch2image', form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      imageUuid = sketch2imageResponse.data.images[0].image_uuid;
      console.log("image uuid", imageUuid);

    } catch (error) {
      console.error('Error during sketch2image API call:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      return res.status(500).send({ message: 'Error during image generation request.' });
    }
    // console.log("image uuid", imageUuid)

    fs.unlink(sketchImagePath, (err) => {
      if (err) {
        console.error('Failed to delete the uploaded sketch image:', err);
      } else {
        console.log(`Uploaded sketch image ${sketchImagePath} was deleted.`);
      }
    });
    
    const endTime = Date.now() + 100000;

    const intervalId = setInterval(async () => {
      if (Date.now() >= endTime) {
        clearInterval(intervalId);
        return res.status(408).send({ message: 'Request Timeout: Image could not be retrieved in time.' });
      }

      try {
        const response = await axios.get(`https://ek6vmxx07wvmnf-8000.proxy.runpod.net/getimage/${imageUuid}`, {
          params: {
            delete: false,
            type: 'PNG',
            base64_c: false,
            quality_level: 90,
          },
          headers: {
            'accept': 'application/json'
          },
          responseType: 'arraybuffer'
        });

        if (response.data) {
          const dataStr = response.data.toString();
          if (dataStr.includes("Image not found")) {
            console.log("Image not found in response, retrying...");
          } else {
            const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
            const imageDataUrl = `data:image/png;base64,${imageBase64}`;

            const generatedImage = new GeneratedImage({
              userId: userId,
              image: response.data
            });
            await generatedImage.save();

            clearInterval(intervalId);
            return res.status(200).send({ imageUrls: imageDataUrl, message: 'Image processed successfully' });
          }
        }
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.data.includes("Image not found"))) {
          console.log("Image not found, retrying...");
        } else {
          console.error('Error during image retrieval:', error);
          clearInterval(intervalId);
          return res.status(500).send({ message: 'Internal server error during image retrieval.' });
        }
      }
    }, 3000);
    // res.send({ uuid: imageUuid });
    // res.status(200).send({ message: 'Image processed successfully' });

  } catch (error) {
    // console.error('Error during sketch to image process:', error);
    if (error.response) {
      console.error('Error details:', error.response.data.detail);
    }

    res.status(500).send({ message: 'Internal server error' });
  }
});



app.post('/text-to-image',upload.none(), async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the raw request body

    console.log("API called: text to image");
    console.log("Headers:", req.headers);
    console.log("Request Body:", req.body); // Log the raw request body

    const form = new FormData();
    const { prompt, width, height, styleType, model_xl, negativePrompt, maintainAspectRatio } = req.body;
    const userId = req.body.userId; // Assuming the userId is sent in the body of the request

    // Check and log the received values
    console.log("Prompt:", prompt );
    console.log("Style Type:", styleType);
    console.log("User ID:", userId);
    console.log(req.body.prompt); // Should log "cat"
    console.log( "model xl :: ",req.body.styleType);
    // Append parameters to form data

    // const userId = req.body.userId; // Assuming the userId is sent in the body of the request
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      console.log("User not found. UserId:", userId);
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the user has any image generation limits left
    if (user.no_of_images_left <= 0) {
      return res.status(400).send({ message: "You have reached the image generation limit" });
    }

    // Decrement the user's image generation limit
    const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } }, { new: true });
    if (!updatedUser) {
      console.log("Error updating user:", updatedUser);
      return res.status(500).send({ message: "Error updating user" });
    }


    // Append text fields
    // form.append('strength', '0.8');
    form.append('guidance_scale', '7.5');
    form.append('prompt', req.body.prompt || 'high quality interior'); // Use the prompt from the request or a default value
    form.append('width', req.body.width || '512');
    form.append('height', req.body.height || '512');
    form.append('steps', '25');
    form.append('safetensor', 'false');
    form.append('model_xl', req.body.model_xl||'false');
    form.append('negative_prompt', req.body.negativePrompt || 'bad, blurry, low quality, low resolution, deformed'); // Long string as in the example
    form.append('clip_skip', '0');
    form.append('num_images', '1');
    form.append('style', req.body.styleType || 'default');
    form.append('seed', ''); // Empty string or any specific value if needed
    form.append('sketch_image_uuid', '456'); // Example UUID, replace with actual if available
    form.append('revert_extra', ''); // Empty string or any specific value if needed
    // form.append('callback_url', ''); // Empty string or any specific value if needed
    form.append('maintain_aspect_ratio', req.body.maintainAspectRatio || 'false');
    form.append('scheduler', 'Default');    
    try {
      sketch2imageResponse = await axios.post('https://ek6vmxx07wvmnf-8000.proxy.runpod.net/text2image', form, {
        headers: {
          ...form.getHeaders(),
        },
      });

      imageUuid = sketch2imageResponse.data.images[0].image_uuid;
      console.log("image uuid", imageUuid);

    } catch (error) {
      console.error('Error during sketch2image API call:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      return res.status(500).send({ message: 'Error during image generation request.' });
    }
    console.log("image uuid", imageUuid)


    const endTime = Date.now() + 100000;

    const intervalId = setInterval(async () => {
      if (Date.now() >= endTime) {
        clearInterval(intervalId);
        return res.status(408).send({ message: 'Request Timeout: Image could not be retrieved in time.' });
      }

      try {
        const response = await axios.get(`https://ek6vmxx07wvmnf-8000.proxy.runpod.net/getimage/${imageUuid}`, {
          params: {
            delete: true,
            type: 'PNG',
            base64_c: false,
            quality_level: 90,
          },
          headers: {
            'accept': 'application/json'
          },
          responseType: 'arraybuffer'
        });

        if (response.data) {
          const dataStr = response.data.toString();
          if (dataStr.includes("Image not found")) {
            console.log("Image not found in response, retrying...");
          } else {
            const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
            const imageDataUrl = `data:image/png;base64,${imageBase64}`;

            const generatedImage = new GeneratedImage({
              userId: userId,
              image: response.data
            });
            await generatedImage.save();

            clearInterval(intervalId);
            return res.status(200).send({ imageUrls: imageDataUrl, message: 'Image processed successfully' });
          }
        }
      } catch (error) {
        if (error.response && (error.response.status === 404 || error.response.data.includes("Image not found"))) {
          console.log("Image not found, retrying...");
        } else {
          console.error('Error during image retrieval:', error);
          clearInterval(intervalId);
          return res.status(500).send({ message: 'Internal server error during image retrieval.' });
        }
      }
    }, 3000);

    // setTimeout(async () => {
    //   const response = await axios.get(`https://ek6vmxx07wvmnf-8000.proxy.runpod.net/getimage/${imageUuid}`, {
    //     params: {
    //       delete: true,
    //       type: 'PNG',
    //       base64_c: false,
    //       quality_level: 90,
    //     },
    //     headers: {
    //       'accept': 'application/json'
    //     },
    //     responseType: 'arraybuffer'
    //   });

    //   const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    //   const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    //   const generatedImage = new GeneratedImage({
    //     userId: userId,
    //     image: response.data
    //   });
    //   await generatedImage.save();
      
    //   res.status(200).send({ imageUrls: imageDataUrl, message: 'Image processed successfully' });
    // }, 50000); // Delay time in milliseconds

    // res.status(200).send({ message: 'Image processed successfully' });
    // res.status(200).send({ message: 'Image processed successfully' });

  } catch (error) {
    // console.error('Error during sketch to image process:', error);
    if (error.response) {
      console.error('Error details:', error.response);
    }

    res.status(500).send({ message: 'Internal server error' });
  }
});




let respTextData;
app.post('/text-callback', async (req, res) => {
  try {
    console.log("text callback called")
    const textUuid = req.body.text_uuid;
    console.log("uuid :",textUuid )
    const response = await axios.get(`https://ek6vmxx07wvmnf-8000.proxy.runpod.net/gettext/${textUuid}`, {
      headers: {
        'accept': 'application/json'
      }});

    console.log(response.data)
    respTextData = response.data.prompt_variants[0]
    res.status(200).send({ message: 'Text processed successfully' });
  } catch (error) {
    console.error('Error handling image callback:', error);
    res.status(500).send({ message: 'Error handling image callback' });
  }
});

app.get('/check-text-status/:userId/:uuid', async (req, res) => {
  const { uuid, userId } = req.params;
  // console.log("checking status for :::", uuid, userId)
  if (respTextData) {
    console.log("checking status for")



    res.status(200).send({ en_prompt: respTextData });
    respTextData='';
    delete respTextData;
    
    if (!respTextData) {
      console.log("deleted text results :::")
    }

  } else {
    res.status(202).send({ message: 'Processing' }); // 202 Accepted - processing not complete
  }
});

app.post('/prompt-enhancer', upload.none(), async (req, res) => {
  try {
    const form = new FormData();

    console.log(req.body.userId); // Should log "cat"
    // Append parameters to form data

    const userId = req.body.userId; // Assuming the userId is sent in the body of the request
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      console.log("User not found. UserId:", userId);
      return res.status(404).send({ message: "User not found" });
    }



    // Decrement the user's image generation limit


    // Append text fields

    form.append('prompt', req.body.prompt); // Use the prompt from the request or a default value

    form.append('sketch_image_uuid', ''); // Example UUID, replace with actual if available
    form.append('revert_extra', ''); // Empty string or any specific value if needed
    form.append('max_length', '150'); // Empty string or any specific value if needed
    // num_return_sequences
    form.append('num_return_sequences', '1'); // Empty string or any specific value if needed

    const callbackUrltext = `${callbackUrl}/text-callback`; // Replace with your actual callback endpoint URL
    form.append('callback_url', callbackUrltext);

    // First API call to generate the image 
    const response = await axios.post('https://ek6vmxx07wvmnf-8000.proxy.runpod.net/promptenhancer', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    console.log(response.data);

    const textUuid = response.data.text_uuid;
    console.log("image uuid", textUuid)


    res.send({ uuid: textUuid });
    // res.status(200).send({ message: 'Image processed successfully' });

  } catch (error) {
    // console.error('Error during sketch to image process:', error);
    if (error.response) {
      console.error('Error details:', error.response.data.detail);
    }

    res.status(500).send({ message: 'Internal server error' });
  }
});

// Determine the delay based on the maximum of width or height
// const maxDimension = Math.max(req.body.width || 512, req.body.height || 512);
// let delayInSeconds = 15; // Default delay for 512
// if (maxDimension > 512 && maxDimension <= 768) {
//   delayInSeconds = 25;
// } else if (maxDimension > 768) {
//   delayInSeconds = 45;
// }
// console.log(delayInSeconds)
// // Wait for the specified delay
// await new Promise(resolve => setTimeout(resolve, delayInSeconds * 1000));

// // Second API call to retrieve the generated image using the UUID
// const response = await axios.get(`https://ek6vmxx07wvmnf-8000.proxy.runpod.net/getimage/${imageUuid}`, {
//   params: {
//     delete: true,
//     type: 'PNG',
//     base64_c: false,
//     quality_level: 90,
//   },
//   headers: {
//     'accept': 'application/json'
//   },
//   responseType: 'arraybuffer' // If you expect a binary image response
// });
// console.log(response.data)
// // Store the generated image in the database
// const generatedImage = new GeneratedImage({
//   userId: userId,
//   image: response.data // Assuming the image is stored as binary data
// });
// await generatedImage.save();
// // Convert binary data to base64 string if needed
// const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
// const imageDataUrl = `data:image/png;base64,${imageBase64}`;




// // Example of updating a route to use Mongoose syntax
// app.post("/generate-image", async (req, res) => {
//   console.log(req.body); // Now req.body should be populated with your JSON data.
//   const form = new FormData();
//   for (let [key, value] of form.entries()) {
//     console.log(`${key}: ${value}`);
//   }

//   const { generatorType, promptText, negativePromptText, styleType, aspectRatio, scale, userId } = req.body;

//   try {
//     // For demonstration, use Lorem Picsum for placeholder images

// console.log("bodyrequest::::::", req.body)

//     // Prepare headers and body for the Stable Diffusion API request
//     const apiHeaders = {
//       "Content-Type": "application/json",
//       // "Authorization": "Bearer YOUR_API_KEY", // Replace 'YOUR_API_KEY' with your actual API key
//     };

//     const apiBody = JSON.stringify({

//       "key": "0suXBgmo83crN2LystXdbOUv4q4MZwLCTEcHvqlPEUrjUWzuh8WbEyMBNysG",
//       "model_id": "sdxl",
//       "prompt": promptText,
//       "negative_prompt": negativePromptText,
//       "width": "512",
//       "height": "512",
//       "samples": "1",
//       "num_inference_steps": "30",
//       "safety_checker": "no",
//       "enhance_prompt": "yes",
//       "seed": null,
//       "guidance_scale": 7.5,
//       "multi_lingual": "no",
//       "panorama": "no",
//       "self_attention": "no",
//       "upscale": "no",
//       "embeddings_model": null,
//       "lora_model": null,
//       "tomesd": "yes",
//       "clip_skip": "2",
//       "use_karras_sigmas": "yes",
//       "vae": null,
//       "lora_strength": null,
//       "scheduler": "UniPCMultistepScheduler",
//       "webhook": null,
//       "track_id": null,
//       // "base64":"yes"
//       // Add other necessary parameters for Stable Diffusion API
//     });
//     console.log("running api ")

//     // Initial request to generate images
//     const initialResponse = await axios.post("https://stablediffusionapi.com/api/v4/dreambooth", apiBody, { headers: apiHeaders });

// console.log(initialResponse.data.future_links)

// //     if (initialResponse.data.status == 'processing') {
// //       throw new Error('Unexpected response status from the API');
// //     }
// let imageBuffers=[]; // Define imageBuffers here to have a broader scope

// if (initialResponse.data.status == 'success') {
//    imageBuffers = await Promise.all([
//     // axios.get("https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/0-2bf46a60-4485-4aa6-89d7-492fc75d4676.png", { responseType: 'arraybuffer' }),
//     axios.get(initialResponse.data.output, { responseType: 'arraybuffer' }),
//     // axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
//   ]);}
//  else if (initialResponse.data.status == 'processing') {

//       await new Promise(resolve => setTimeout(resolve, initialResponse.data.eta * 3000));
//       const futureLink = initialResponse.data.future_links[0]; // Example: accessing the first link
// console.log("future bright he:",futureLink)
//      imageBuffers = await Promise.all([
//       axios.get(futureLink,{ responseType: 'arraybuffer' }),

//     ]);}

//     console.log(imageBuffers)
//     const user = await User.findById(userId);

//     if (!user) {
//       console.log("User not found. UserId:", userId);
//       res.status(404).send({ message: "User not found" });
//       return;
//     }

//     if (user.no_of_images_left <= 0) {
//       return res.status(400).send({ message: "You have reached the image generation limit" });
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });

//     if (!updatedUser) {
//       console.log("Error updating user:", updatedUser);
//       return res.status(500).send({ message: "Error updating user" });
//     }

//     const generatedImages = await GeneratedImage.insertMany(
//       imageBuffers.map((response) => ({ image: response.data, userId: user.id }))
//     );

//     res.send({ imageUrls: generatedImages.map((image) => `data:image/jpeg;base64,${image.image.toString('base64')}`) });
//   } catch (error) {
//     console.error("Error during image generation:", error);
//     res.status(500).send({ message: "Internal server error" });
//   }
// });

// ... (existing code)





app.get("/topimages/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  try {
    const user = await User.findById(userId).populate({
      path: 'generatedImages',
      options: { limit: 8 } // Limiting the number of images fetched
    });

    if (!user) {
      console.log("User not found. UserId:", userId);
      res.status(404).send({ message: "User not found" });
      return;
    }

    const imageUrls = user.generatedImages.map((image) => `data:image/jpeg;base64,${image.image.toString('base64')}`);
    res.send({ images: imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});









app.get("/images/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId)
  try {
    const user = await User.findById(userId).populate('generatedImages');

    if (!user) {
      console.log("User not found. UserId:", userId);
      res.status(404).send({ message: "User not found" });
      return;
    }

    const imageUrls = user.generatedImages.map((image) => `data:image/jpeg;base64,${image.image.toString('base64')}`);
    res.send({ images: imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});
app.get("/api/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("tjos ", userId)
  try {
    const user = await User.findById(userId).populate("subscription");
    console.log("user:::", user)
    if (!user) {
      console.log("User not found. UserId:", userId);
      return res.status(404).send({ message: "User not found" });
    }

    const userData = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      no_of_images_left: user.no_of_images_left,
      subscription: user.subscription
        ? {
          // ... other subscription properties
          name: user.subscription.name,
          priceMonthly: user.subscription.priceMonthly,
          priceYearly: user.subscription.priceYearly,
          generatedImages: user.subscription.generatedImages,
          generationSpeed: user.subscription.generationSpeed,
          videoGenerations: user.subscription.videoGenerations,
          licenseType: user.subscription.licenseType,
          privacy: user.subscription.privacy,
        }
        : null,
    };

    res.send({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});
app.use(express.static(path.join(__dirname, 'my-app/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'my-app/build', 'index.html'));
});
// app.listen(8000, () => {
//   console.log(`Server is running on port `);
// });
// app.get("/user/:userId", async (req, res) => {
//   const userId = req.params.userId;

//   try {
//     const user = await User.findById(userId).populate('subscription');

//     if (!user) {
//       console.log("User not found. UserId:", userId);
//       return res.status(404).send({ message: "User not found" });
//     }

//     const userData = {
//       fname: user.fname,
//       lname: user.lname,
//       email: user.email,
//       no_of_images_left: user.no_of_images_left,
//       subscribed_monthly: user.subscribed_monthly,
//       subscribed_yearly: user.subscribed_yearly,
//     };

//     // Check if user has a subscription before accessing its properties
//     if (user.subscription) {
//       userData.subscription = {
//         name: user.subscription.name,
//         priceMonthly: user.subscription.priceMonthly,
//         priceYearly: user.subscription.priceYearly,
//         generatedImages: user.subscription.generatedImages,
//         generationSpeed: user.subscription.generationSpeed,
//         videoGenerations: user.subscription.videoGenerations,
//         licenseType: user.subscription.licenseType,
//         privacy: user.subscription.privacy,
//       };
//     } else {
//       userData.subscription = null;
//     }

//     res.send({ user: userData });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     res.status(500).send({ message: "Internal server error" });
//   }
// });

// ... (existing code)

app.listen(8000, () => {
  console.log("Server starting at 8000");
});

// app.listen(8000, '92.240.254.103', () => {
//   console.log("Server starting at 92.240.254.103 on port 8000");
// });

