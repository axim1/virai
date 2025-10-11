const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const path = require('path');
const { User, Subscription, GeneratedImage, Chat } = require('./models');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid'); // Import UUID
const { OpenAI } = require('openai');
const imageEnhancementRoutes = require('./routes/serverless_apis');
const sketchToImageServerless = require('./routes/serverless_sketch_to_image');
const d3Serverless = require('./routes/3d-model-generator');
const paymentRoutes = require('./routes/paymentRoutes');
const chatRoutes = require('./routes/chatRoutes');
require('./cron/recurringBillingJob');

const t2i = require('./routes/text-to-image');
const Queue = require('better-queue');

require('dotenv').config();
const fs = require('fs');

const callbackUrl = process.env.CALLBACK_URL;
// const multer = require("multer");
// const path = require("path");
const VIDEO_OUTPUT_DIR = path.join(__dirname, 'videos');

if (!fs.existsSync(VIDEO_OUTPUT_DIR)) {
  fs.mkdirSync(VIDEO_OUTPUT_DIR);
}

const session = require("express-session");
const passport = require("passport");
require("./passport-config"); // Load the Passport config

// Middleware
const IMAGES_DIR = path.join(__dirname, '../images'); // or wherever you serve from

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/images', express.static(path.join(__dirname, '../images')));

app.use(cors({ origin: '*' }));
const { isStringObject } = require("util/types");
// Serve static files
app.use('/api/models', (req, res, next) => {
  console.log('📦 [MODEL-SERVE] Request for model:', {
    path: req.path,
    method: req.method,
    url: req.url
  });
  next();
}, express.static('public/models'));

app.use(session({
  secret: "your-session-secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/sl', imageEnhancementRoutes);
app.use('/api/serverless', sketchToImageServerless);
app.use('/api/serverless', d3Serverless);
app.use('/api/serverless', t2i);
app.use('/api', paymentRoutes); // Prefix route
app.use('/api', chatRoutes); // Add chat routes

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
    // First API call to get the access token

const uri = "mongodb+srv://asim6832475:1234@cluster0.ukza83p.mongodb.net/?retryWrites=true&w=majority";
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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Legacy chat endpoint - keeping for backward compatibility but will be deprecated
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  console.log('user message :: ', messages)
  try {

    faqData = [
      {
        question: 'What is AI-powered text-to-image generation?',
        answer: 'AI-powered text-to-image generation is a process that uses advanced algorithms and machine learning models to create visual images based on descriptive text provided by the user.'
      },
      {
        question: 'How does your service work?',
        answer: 'Our service utilizes AI models that analyze your text description and generate images that match your description. The process involves natural language processing and image generation using neural networks.'
      },
      {
        question: 'What kind of texts can I use to generate images?',
        answer: 'You can use any descriptive text that clearly outlines the scene, object, or concept you want to visualize. The more detailed and specific the description, the more accurate the resulting image will be.'
      },
      {
        question: 'How long does it take to generate an image?',
        answer: 'The time to generate an image can vary depending on the complexity of the description and the current load on our system. It typically takes a few minutes.'
      },
      {
        question: 'Are the generated images unique?',
        answer: 'Yes, each generated image is unique and created based on your specific text description. This ensures you receive an original image tailored to your requirements.'
      },
      {
        question: 'Can I use the generated images for commercial purposes?',
        answer: 'This depends on the licensing terms of our service. Please read our terms of use and licensing agreements for more information on commercial use.'
      },
      {
        question: 'What image formats are available?',
        answer: 'Images are generated in PNG or JPEG format, according to your preference.'
      },
      {
        question: 'What if I am not satisfied with the generated image?',
        answer: 'If you are not satisfied with the result, you can enter a new text description and generate a new image. You can also contact our customer support for assistance.'
      },
      {
        question: 'How can I contact support?',
        answer: 'You can reach our customer support via email on support@virtuartai.com.'
      },
      {
        question: 'Are my text descriptions and generated images stored?',
        answer: 'Your text descriptions and generated images are stored in accordance with our privacy policy. You can be assured that your data is securely protected.'
      },
      {
        question: 'Can you generate images for any type of description?',
        answer: 'Our AI can generate images for a wide range of descriptions, but it may have limitations with very abstract or vague descriptions. We recommend providing as specific and detailed descriptions as possible.'
      },
      {
        question: 'How can I start using your service?',
        answer: 'To get started, simply register on our website, enter your text description, and click the button to generate an image. It\'s easy and quick!'
      }]
    const prompt='context:\n\n' + faqData+  '\n\nbased on the following conversation, generate a response as if you are the assistant. \n\n' + messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const userMessage = messages[messages.length - 1].content;
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'assistant', content: prompt }]
    });
    

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});



app.get("/subscriptions", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.send({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});



// Start Apple login
app.get("/auth/apple", passport.authenticate("apple"));

// Callback from Apple
// Callback from Apple
app.post(
  "/auth/apple/callback",
  (req, res, next) => {
    console.log("\n====================================");
    console.log("🍎 [Apple Callback Route Triggered]");
    console.log("Method:", req.method);
    console.log("Incoming body:", req.body);
    console.log("====================================");
    next();
  },
  passport.authenticate("apple", { failureRedirect: "/login", session: true }),
  async (req, res) => {
    console.log("\n✅ [Apple Authentication Passed]");
    console.log("Session user object available:", !!req.user);
    console.log("req.user content:", JSON.stringify(req.user, null, 2));

    try {
      if (!req.user) {
        console.error("❌ ERROR: req.user is missing after passport.authenticate()");
        return res.status(500).send({
          message: "Apple authentication succeeded but user object not attached.",
        });
      }

      const user = req.user;
      const frontendUrl = `${process.env.FRONTEND_URL}home`;

      const userData = {
        _id: user._id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        no_of_images_left: user.no_of_images_left,
        subscribed_monthly: user.subscribed_monthly,
        subscribed_yearly: user.subscribed_yearly,
      };

      console.log("📦 Prepared userData for redirect:", userData);

      // Convert user data to URL parameters
      const query = new URLSearchParams(userData).toString();
      const redirectUrl = `${frontendUrl}?${query}`;

      console.log("🔁 Redirecting to frontend:", redirectUrl);
      console.log("====================================\n");

      res.redirect(redirectUrl);
    } catch (err) {
      console.error("❌ Apple callback route error:", err);
      console.error("Stack trace:", err.stack);
      res.status(500).send({ message: "Internal Server Error in Apple callback." });
    }
  }
);




// app.get('/auth/apple', passport.authenticate('apple'));

// app.post('/auth/apple/callback',
//   passport.authenticate('apple', { failureRedirect: '/login', session: true }),
//   (req, res) => {
//     const user = req.user;
//     const frontendUrl = `${process.env.FRONTEND_URL}home`;
//     const userData = {
//       _id: user._id,
//       email: user.email,
//       fname: user.fname,
//       lname: user.lname,
//       no_of_images_left: user.no_of_images_left,
//       subscribed_monthly: user.subscribed_monthly,
//       subscribed_yearly: user.subscribed_yearly,
//     };
//     const query = new URLSearchParams(userData).toString();
//     res.redirect(`${frontendUrl}?${query}`);
//   }
// );

// Route to initiate Google sign-in
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback route for Google
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Send user data to frontend
    const user = req.user;
    const frontendUrl = `${process.env.FRONTEND_URL}home`;

    const userData = {
      _id: user._id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      no_of_images_left: user.no_of_images_left,
      subscribed_monthly: user.subscribed_monthly,
      subscribed_yearly: user.subscribed_yearly,
    };

    // Option 1: Redirect with user data in query params (not ideal for sensitive data)
    const query = new URLSearchParams(userData).toString();
    res.redirect(`${frontendUrl}?${query}`);
  }
);

app.get('/auth/user', (req, res) => {
  res.send(req.user || null);
});

// Logout
app.get('/auth/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send({ message: "Logout error" });
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  });
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


app.post("/api/updateUser", upload.single("profilePic"), async (req, res) => {
  const {
    userId, fname, lname, email, phone,
    userType, companyName, address, vatNumber
  } = req.body;
console.log('updateing user')
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: "User not found" });

    const profilePicPath = req.file ? req.file.path : user.profilePic;

    user.fname = fname || user.fname;
    user.lname = lname || user.lname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.userType = userType || user.userType;
    user.companyName = userType === "company" ? companyName : null;
    user.address = userType === "company" ? address : null;
    user.vatNumber = userType === "company" ? vatNumber : null;
    user.profilePic = profilePicPath;
    console.log("saving user")
    await user.save();
    res.send({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});


app.post("/api/signup", upload.single("profilePic"), async (req, res) => {
  const {
    fname, lname, email, password, phone,
    subscriptionName, userType,
    companyName, address, vatNumber
  } = req.body;
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
      userType,
      companyName: userType === 'company' ? companyName : null,
      address: userType === 'company' ? address : null,
      vatNumber: userType === 'company' ? vatNumber : null,
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

// Custom profile pic route
app.get("/api/uploads/profilepic/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.sendFile(filePath);
  });
});
// const { v4: uuidv4 } = require('uuid');


const taskStatusMap ={};
const pollVideoStatus = (uuid, taskId, headers) => {
  const poll = setInterval(async () => {
    try {
      const queryRes = await axios.get(
        `https://api.minimaxi.chat/v1/query/video_generation?task_id=${taskId}`,
        { headers }
      );
      const status = queryRes.data.status;

      if (status === 'Success') {
        clearInterval(poll);
        const fileId = queryRes.data.file_id;

        // const fileRes = await axios.get(
        //   `https://api.minimaxi.chat/v1/files/retrieve?file_id=${fileId}`,
        //   { headers }
        // );

        // taskStatusMap[uuid] = {
        //   taskId,
        //   downloadUrl: fileRes.data.file.download_url,
        //   status: 'ready',
        // };
        const fileRes = await axios.get(
  `https://api.minimaxi.chat/v1/files/retrieve?file_id=${fileId}`,
  { headers }
);

const videoUrl = fileRes.data.file.download_url;
const videoFilename = `video-${Date.now()}.mp4`;
const videoPath = path.join(IMAGES_DIR, videoFilename);
console.log('video path: ', videoPath)
// Download and save the video locally
const writer = fs.createWriteStream(videoPath);
const videoStream = await axios({
  method: 'get',
  url: videoUrl,
  responseType: 'stream'
});
videoStream.data.pipe(writer);

writer.on('finish', async () => {
  const relativePath = `/images/${videoFilename}`;
  const fullVideoUrl = `${process.env.BACKEND_URL}${relativePath}`;

  try {
    const newVideoEntry = new GeneratedImage({
      type: 'video',
      imageUrl: relativePath,
      prompt: taskStatusMap[uuid].prompt || 'Video generated from prompt',
      userId: taskStatusMap[uuid].userId || null, // Must be passed earlier in payload
    });

    await newVideoEntry.save();

    taskStatusMap[uuid] = {
      taskId,
      downloadUrl: fullVideoUrl,
      status: 'ready',
      dbId: newVideoEntry._id
    };
  } catch (err) {
    console.error('Failed to save video entry to DB:', err);
    taskStatusMap[uuid] = {
      taskId,
      status: 'error'
    };
  }
});


writer.on('error', (err) => {
  console.error('Video save failed:', err);
  taskStatusMap[uuid] = {
    taskId,
    status: 'error'
  };
});

      } else if (['Fail', 'Unknown'].includes(status)) {
        clearInterval(poll);
        taskStatusMap[uuid] = { taskId, status: 'error' };
      }
    } catch (err) {
      clearInterval(poll);
      taskStatusMap[uuid] = { taskId, status: 'error' };
      console.error('Polling error:', err.message || err);
    }
  }, 10000);
};



app.post('/generate-video', upload.single('image'), async (req, res) => {
  const { prompt } = req.body;
  const imageProvided = !!req.file;

  if (!prompt) {
    return res.status(400).send({ message: 'Prompt is required' });
  }

  const taskPayload = {
    prompt,
    model: imageProvided ? 'S2V-01' : 'T2V-01',
  };

  if (imageProvided) {
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');
    taskPayload.subject_reference = [
      {
        type: 'character',
        image: [`data:image/jpeg;base64,${base64Image}`],
      },
    ];
  }

  const headers = {
    'authorization': `Bearer ${process.env.HAILOU_API_KEY}`,
    'content-type': 'application/json',
  };

  try {
    const submitRes = await axios.post(
      'https://api.minimaxi.chat/v1/video_generation',
      taskPayload,
      { headers }
    );

    const taskId = submitRes.data.task_id;
    console.log(submitRes)
    // Save taskId in memory or database keyed by a UUID
    const videoUuid = uuidv4();
taskStatusMap[videoUuid] = {
  taskId,
  status: 'pending',
  userId: req.body.userId || null,
  prompt
};

    // Begin polling in background
    pollVideoStatus(videoUuid, taskId, headers);

    res.status(202).send({ uuid: videoUuid });
  } catch (err) {
    console.error('Error starting video generation:', err.response?.data || err.message);
    res.status(500).send({ message: 'Video generation failed to start' });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {});
  }
});

app.get('/check-video/:uuid', (req, res) => {
  const { uuid } = req.params;
  const statusEntry = taskStatusMap[uuid];
  console.log(taskStatusMap)

  if (!statusEntry) {
    return res.status(404).send({ message: 'Unknown video UUID' });
  }

  if (statusEntry.status === 'pending') {
    return res.status(202).send({ status: 'pending' });
  }

  if (statusEntry.status === 'ready') {
    console.log(statusEntry.downloadUrl)
    return res.status(200).send({ downloadUrl: statusEntry.downloadUrl });
  }

  return res.status(500).send({ status: 'error', message: 'Video generation failed' });
});




let respTextData;
app.post('/text-callback', async (req, res) => {
  try {
    console.log("text callback called")
    const textUuid = req.body.text_uuid;
    console.log("uuid :",textUuid )
    const response = await axios.get(`https://b66ogihdsn67gw-8000.proxy.runpod.net/gettext/${textUuid}`, {
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
    const response = await axios.post('https://b66ogihdsn67gw-8000.proxy.runpod.net/promptenhancer', form, {
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









// app.get("/images/:userId", async (req, res) => {
//   const userId = req.params.userId;
//   console.log(userId)
//   try {
//     const user = await User.findById(userId).populate('generatedImages');

//     if (!user) {
//       console.log("User not found. UserId:", userId);
//       res.status(404).send({ message: "User not found" });
//       return;
//     }

//     const imageUrls = user.generatedImages.map((image) => `data:image/jpeg;base64,${image.image.toString('base64')}`);
//     res.send({ images: imageUrls });
//   } catch (error) {
//     console.error("Error fetching images:", error);
//     res.status(500).send({ message: "Internal server error" });
//   }
// });
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


    res.send({ user });

        // res.send({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});



// const imageRequestQueue = new Queue(async (task, cb) => {
//   try {
//     const { filter, page = 1, limit = 8, userId } = task;

//     console.log("✅ Backend: /api/images was hit");
//     console.log("filter", filter);

//     const query = {};
//     let sort = {};

//     // Filter logic
//     if (filter === "Owned by Me" && userId) {
//       query.userId = userId;
//     }

//     // Sort logic
//     switch (filter) {
//       case "Newest":
//         sort = { createdAt: -1 };
//         break;
//       case "Oldest":
//         sort = { createdAt: 1 };
//         break;
//       case "Most Liked":
//         sort = { likes: -1 };
//         break;
//       case "Most Viewed":
//         sort = { views: -1 };
//         break;
//       case "Trending":
//         sort = { likes: -1, views: -1 };
//         break;
//       default:
//         // Fallback: treat filter as keyword search
//         if (filter) {
//           query.description = { $regex: filter, $options: 'i' };
//         }
//     }

//     console.log("🔍 Query:", query);
//     console.log("📊 Sort:", sort);

//     const images = await GeneratedImage.find(query)
//       .sort(sort)
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     console.log("📦 Found images:", images.length);
//     console.log("📝 First image type:", images[0]?.type);
//     console.log("🔗 First image modelUrl:", images[0]?.modelUrl);

//     const imageUrls = images.map(img => {
//       let imageData;
//       if (img.type === '3d_model') {
//         // For 3D models, ensure we're sending the raw GLB data
//         imageData = `data:model/gltf-binary;base64,${img.image.toString('base64')}`;
//         console.log(`📦 Processing 3D model ${img._id}:`, {
//           size: img.image.length,
//           type: img.type
//         });
//       } else {
//         // For regular images
//         imageData = `data:image/png;base64,${img.image.toString('base64')}`;
//       }

//       const processed = {
//         _id: img._id,
//         type: img.type || 'image',
//         image: imageData,
//         likes: img.likes || 0,
//         views: img.views || 0,
//         fires: img.fires || 0,
//         shares: img.shares || 0,
//         owner: img.owner || {},
//         createdAt: img.createdAt,

//             // Optional fields — fallback to defaults if not present
//     prompt: img.prompt || '',
//     negativePrompt: img.negativePrompt || '',
//     width: img.width || '',
//     height: img.height || '',
//     steps: img.steps || '',
//     guidanceScale: img.guidanceScale || '',
//     seed: img.seed || null,
//     scheduler: img.scheduler || 'normal',
//     clipSkip: img.clipSkip || 0,
//     style: img.style || 'default',
//     model: img.model || 'default',
//     modelUrl: img.modelUrl || null

//       };

//       console.log(`🖼️ Processing ${img.type === '3d_model' ? 'model' : 'image'} ${img._id}:`, {
//         type: processed.type,
//         hasImage: !!processed.image,
//         imageSize: img.image?.length,
//         prompt: processed.prompt
//       });
//       return processed;
//     });

//     console.log("✅ Final result:", { 
//       totalImages: imageUrls.length,
//       firstImageType: imageUrls[0]?.type,
//       firstImageModelUrl: imageUrls[0]?.modelUrl
//     });

//     cb(null, { images: imageUrls });
//   } catch (error) {
//     console.error("❌ Queue error:", error);
//     cb(error);
//   }
// });


const imageRequestQueue = new Queue(async (task, cb) => {
  try {
    const { filter, page = 1, limit = 8, userId } = task;
    console.log("✅ Backend: /api/images was hit");

    const query = {};
    let sort = {};

    // if (filter === "Owned by Me" && userId) {
    //   query.userId = userId;
    // }
if (filter === "Owned by Me" && userId) {
  if (mongoose.isValidObjectId(userId)) {
    query.userId = new mongoose.Types.ObjectId(userId);
    console.log('owner but me');
  } else {
    return cb(new Error('Invalid userId'));
  }
}

    switch (filter) {
      case "Newest":
        sort = { createdAt: -1 };
        break;
      case "Oldest":
        sort = { createdAt: 1 };
        break;
      case "Most Liked":
        sort = { likes: -1 };
        break;
      case "Most Viewed":
        sort = { views: -1 };
        break;
      case "Trending":
        sort = { likes: -1, views: -1 };
        break;
      default:
        if (filter) {
          query.description = { $regex: filter, $options: 'i' };
        }
    }

const images = await GeneratedImage.find(query)
  .sort(sort)
  .skip((page - 1) * limit)
  .limit(Number(limit))
  .populate('userId', 'fname lname profilePic'); // Only populate needed fields


    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    const imageUrls = images.map(img => {
      let imageData;

      if (img.type === '3d_model') {
        imageData = `${backendUrl}${img.imageUrl}`;  // .glb
      } else {
        imageData = `${backendUrl}${img.imageUrl}`;  // .png/.jpg
      }

      return {
        _id: img._id,
        type: img.type || 'image',
        image: imageData,
        likes: img.likes || 0,
        views: img.views || 0,
        fires: img.fires || 0,
        shares: img.shares || 0,
        owner: img.userId
  ? {
      name: `${img.userId.fname} ${img.userId.lname}`,
      profilePic: img.userId.profilePic || null,
    }
  : {
      name: 'Anonymous',
      profilePic: null,
    },

        createdAt: img.createdAt,

        prompt: img.prompt || '',
        negativePrompt: img.negativePrompt || '',
        width: img.width || '',
        height: img.height || '',
        steps: img.steps || '',
        guidanceScale: img.guidanceScale || '',
        seed: img.seed || null,
        scheduler: img.scheduler || 'normal',
        clipSkip: img.clipSkip || 0,
        style: img.style || 'default',
        model: img.model || 'default',
        modelUrl: img.modelUrl || null,
      };
    });

    cb(null, { images: imageUrls });
  } catch (error) {
    console.error("❌ Queue error:", error);
    cb(error);
  }
});


app.get('/api/images', async (req, res) => {
  try {
    console.log('✅ Backend: /api/images was hit');

    const { filter, page = 1, limit = 8, userId } = req.query;
    console.log("filter", filter, userId)
    // Add request to queue
    imageRequestQueue.push({ filter, page, limit, userId }, (err, result) => {
      if (err) {
        console.error("Error processing image request:", err);
        return res.status(500).json({ 
          error: "Error fetching images",
          message: err.message 
        });
      }
      // console.log("result")
      res.json(result);
    });
  } catch (error) {
    console.error("Error in /api/images:", error);
    res.status(500).json({ 
      error: "Error fetching images",
      message: error.message 
    });
  }
});



app.post("/api/images/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    console.log('image id: ', id, 'user id:', userId);
    
    const image = await GeneratedImage.findByIdAndUpdate(
      id, 
      { $inc: { likes: 1 } }, 
      { new: true }
    );
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error liking image:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/images/:id/fire", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    console.log('fire image id: ', id, 'user id:', userId);
    
    const image = await GeneratedImage.findByIdAndUpdate(
      id, 
      { $inc: { fires: 1 } }, 
      { new: true }
    );
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error firing image:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/images/:id/share", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    console.log('share image id: ', id, 'user id:', userId);
    
    const image = await GeneratedImage.findByIdAndUpdate(
      id, 
      { $inc: { shares: 1 } }, 
      { new: true }
    );
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error sharing image:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/images/:id/view", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    console.log('view image id: ', id, 'user id:', userId);
    
    const image = await GeneratedImage.findByIdAndUpdate(
      id, 
      { $inc: { views: 1 } }, 
      { new: true }
    );
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    
    res.json(image);
  } catch (error) {
    console.error('Error viewing image:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.use(express.static(path.join(__dirname, 'my-app/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'my-app/build', 'index.html'));
});

app.listen(8000, () => {
  console.log("Server starting at 8000");
});

