const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const axios = require("axios");
const path = require('path'); // Add this line

const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const sequelize = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  username: "root", // assuming your MySQL server is running on localhost with the default username
  password: "1234", // add your MySQL password here
  database: "vir_ai_db",
});

// ... (existing code)D:\virai\my-app\build\index.html
app.use(express.static(path.join(__dirname, 'my-app/build')));

// Handle all other routes and serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'my-app/build', 'index.html'));
});

// const User = sequelize.define("User", {
//   fname: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   lname: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   no_of_images_left: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     defaultValue: 0,
//   },
//   subscribed_monthly: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false,
//   },
//   subscribed_yearly: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false,
//   },
//   subscription_date: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
// });

// const Subscription = sequelize.define("Subscription", {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   priceMonthly: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   priceYearly: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   generatedImages: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   generationSpeed: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   videoGenerations: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   licenseType: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   privacy: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// User.belongsTo(Subscription); // Establish a relationship between User and Subscription

// const seedDatabase = async () => {
//   try {
//     await sequelize.sync({ force: true }); // Drop existing tables and recreate them

//     const subscriptionsData = [
//       {
//         name: "FREE",
//         priceMonthly: 0,
//         priceYearly: 0,
//         generatedImages: 200,
//         generationSpeed: "Slow",
//         videoGenerations: 10,
//         licenseType: "Personal use only",
//         privacy: "Images are open to public",
//       },
//       {
//         name: "STARTER",
//         priceMonthly: 8,
//         priceYearly: 80,
//         generatedImages: 1200,
//         generationSpeed: "Slow",
//         videoGenerations: 40,
//         licenseType: "Personal use only",
//         privacy: "Images are open to public",
//       },
//       {
//         name: "BUSINESS",
//         priceMonthly: 24,
//         priceYearly: 240,
//         generatedImages: 4800,
//         generationSpeed: "Fast",
//         videoGenerations: 160,
//         licenseType: "Commercial license",
//         privacy: "Images are kept private",
//       },
//       {
//         name: "PREMIUM",
//         priceMonthly: 48,
//         priceYearly: 480,
//         generatedImages: 9600,
//         generationSpeed: "Fast",
//         videoGenerations: 320,
//         licenseType: "Commercial license",
//         privacy: "Images are kept private",
//       },
//     ];

//     await Subscription.bulkCreate(subscriptionsData);
//     console.log("Subscription data seeded successfully");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   }
// };


// const GeneratedImage = sequelize.define("GeneratedImage", {
//   image: {
//     type: DataTypes.BLOB,
//     allowNull: false,
//   },
//   // Add any other properties you need for the generated images
// });

// User.hasMany(GeneratedImage);
// GeneratedImage.belongsTo(User);

// // ... (existing code)
// seedDatabase();
// sequelize.sync({ force: true })
//   .then(() => {
//     console.log("Database and tables created");
//   })
//   .catch((error) => {
//     console.error("Error creating database and tables:", error);
//   });

// ... (existing code)

// sequelize.sync({ force: true }) // Set force to true to drop existing tables and recreate them
//   .then(() => {
//     console.log("Database and tables created");
//   })
//   .catch((error) => {
//     console.error("Error creating database and tables:", error);
//   });

// Routes
// Routes

app.get("/subscriptions", async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll();
    res.send({ subscriptions });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      if (password === user.password) {
        res.send({ message: "Login successfully", user: user });
      } else {
        res.send({ message: "Password and confirm password didn't match" });
      }
    } else {
      res.send({ message: "Please login to proceed" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/signup", async (req, res) => {
  const { fname, lname, email, password, subscriptionName } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      res.send({ message: "User is already registered" });
    } else {
      const subscription = await Subscription.findOne({ where: { name: subscriptionName } });
      if (!subscription) {
        res.send({ message: "Invalid subscription package" });
      } else {
        const newUser = await User.create({
          fname,
          lname,
          email,
          password,
          no_of_images_left: subscription.generatedImages,
          subscribed_monthly: subscriptionName === "STARTER" || subscriptionName === "BUSINESS" || subscriptionName === "PREMIUM",
          subscribed_yearly: subscriptionName === "BUSINESS" || subscriptionName === "PREMIUM",
          SubscriptionId: subscription.id,
        });

        res.send({ message: "Account has been created!! Please Login", user: newUser });
      }
    }
  } catch (error) {
    console.error("Error during signup:", error); // Log the error for debugging
    res.status(500).send({ message: "Internal server error", error: error.message }); // Include the error message in the response
  }
});

// Image generation API endpoint
app.post("/generate-image", async (req, res) => {
  const { generatorType, promptText, negativePromptText, styleType, aspectRatio, scale, userId } = req.body;
  // console.log("image buffers::", userId)

  try {
    // For demonstration, use Lorem Picsum for placeholder images
    const imageBuffers = await Promise.all([
      axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
      axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
      axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
    ]);
    // Save the binary image data in the database
    const user = await User.findByPk(userId);

    if (!user) {
      console.log("User not found. UserId:", userId);
      res.status(404).send({ message: "User not found" });
      return;
    }

    // Check if the user has reached the image limit
    if (user.no_of_images_left <= 0) {
      return res.status(400).send({ message: "You have reached the image generation limit" });
    }

    // Decrement no_of_images_left
    const updatedUser = await User.update(
      { no_of_images_left: sequelize.literal('no_of_images_left - 1') },
      { where: { id: userId } }
    );

    // Check if the user was updated successfully
    if (updatedUser[0] !== 1) {
      console.log("Error updating user:", updatedUser);
      return res.status(500).send({ message: "Error updating user" });
    }
    const generatedImages = await GeneratedImage.bulkCreate(
      imageBuffers.map((response) => ({ image: response.data, UserId: user.id }))
    );

    res.send({ imageUrls: generatedImages.map((image) => `data:image/jpeg;base64,${image.image.toString('base64')}`) });
  } catch (error) {
    console.error("Error during image generation:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});


// ... (existing code)

app.get("/images/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: GeneratedImage }],
    });

    if (!user) {
      console.log("User not found. UserId:", userId);
      res.status(404).send({ message: "User not found" });
      return;
    }

    const imageUrls = user.GeneratedImages.map((image) => `data:image/jpeg;base64,${image.image.toString('base64')}`);
    res.send({ images: imageUrls });
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});
// ... (existing code)

// ... (existing code)

// Add a GET route to fetch user data and subscribed package information
// ... (existing code)
User.belongsTo(Subscription, { foreignKey: 'SubscriptionId' });
Subscription.hasMany(User, { foreignKey: 'SubscriptionId' });
// Change the route from /user/:username to /user/:userId
// Change the route parameter from :username to :userId
app.get("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findOne({
      where: { id: userId }, // Use id instead of email
      include: [{ model: Subscription }],
    });

    if (!user) {
      console.log("User not found. UserId:", userId);
      res.status(404).send({ message: "User not found" });
      return;
    }

    const userData = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      no_of_images_left: user.no_of_images_left,
      subscribed_monthly: user.subscribed_monthly,
      subscribed_yearly: user.subscribed_yearly,
      subscription: {
        name: user.Subscription.name,
        priceMonthly: user.Subscription.priceMonthly,
        priceYearly: user.Subscription.priceYearly,
        generatedImages: user.Subscription.generatedImages,
        generationSpeed: user.Subscription.generationSpeed,
        videoGenerations: user.Subscription.videoGenerations,
        licenseType: user.Subscription.licenseType,
        privacy: user.Subscription.privacy,
      },
    };

    res.send({ user: userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});


// ... (existing code)


// ... (existing code)

app.listen(8000, () => {
  console.log("Server starting at 8000");
});







// app.post("/generate-image", async (req, res) => {
//   const { generatorType, promptText, negativePromptText, styleType, aspectRatio, scale, userId } = req.body;
// console.log("bodyrequest::::::", req.body)
//   try {
//     // Prepare headers and body for the Stable Diffusion API request
//     const apiHeaders = {
//       "Content-Type": "application/json",
//       // "Authorization": "Bearer YOUR_API_KEY", // Replace 'YOUR_API_KEY' with your actual API key
//     };

//     const apiBody = JSON.stringify({

//       "key": "0suXBgmo83crN2LystXdbOUv4q4MZwLCTEcHvqlPEUrjUWzuh8WbEyMBNysG",
//       "model_id": "sdxl",
//       "prompt": "ultra realistic close up portrait ((beautiful pale cyberpunk female with heavy black eyeliner)), blue eyes, shaved side haircut, hyper detail, cinematic lighting, magic neon, dark red city, Canon EOS R3, nikon, f/1.4, ISO 200, 1/160s, 8K, RAW, unedited, symmetrical balance, in-frame, 8K",
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
//       "base64":"yes"
//       // Add other necessary parameters for Stable Diffusion API
//     });

//     // Initial request to generate images
//     const initialResponse = await axios.post("https://stablediffusionapi.com/api/v4/dreambooth", apiBody, { headers: apiHeaders });
// console.log(initialResponse)
//     // Check if the response status is 'success'
//     if (initialResponse.data.status === 'success'){


//     // Retrieve base64 strings by making GET requests to the URLs in the response
//     const base64Strings = await Promise.all(initialResponse.data.output.map(async (url) => {
//       const base64Response = await axios.get(url);
//       return base64Response.data; // This should be the base64 string
//     }));

//     // Convert base64 strings to binary data if necessary
//     const generatedImagesData = base64Strings.map(base64String => Buffer.from(base64String, 'base64'));

//     // Ensure the user exists and has image generation quota left
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }
//     if (user.no_of_images_left <= 0) {
//       return res.status(400).send({ message: "You have reached the image generation limit" });
//     }

//     // Update the user's image generation quota
//     await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -generatedImagesData.length } });

//     // Save the binary data of each image
//     const generatedImages = await GeneratedImage.insertMany(
//       generatedImagesData.map(binaryData => ({
//         image: binaryData, // Binary data of the image
//         userId: userId
//       }))
//     );
// console.log(base64Strings)
//     // Respond with the base64 strings
//     res.send({ imageUrls: base64Strings });

//     }
//     else if (initialResponse.data.status === 'processing') {
//       // Wait for the ETA before making the follow-up fetch request
//       setTimeout(async () => {
//         // Retrieve base64 strings by making GET requests to the URLs in future_links
//         const base64Strings = await Promise.all(initialResponse.data.future_links.map(async (url) => {
//           const base64Response = await axios.get(url);
//           return base64Response.data; // This should be the base64 string
//         }));

//         // Convert base64 strings to binary data if necessary
//         const generatedImagesData = base64Strings.map(base64String => Buffer.from(base64String, 'base64'));

//         // Ensure the user exists and has image generation quota left
//         const user = await User.findById(userId);
//         if (!user) {
//           return res.status(404).send({ message: "User not found" });
//         }
//         if (user.no_of_images_left <= 0) {
//           return res.status(400).send({ message: "You have reached the image generation limit" });
//         }

//         // Update the user's image generation quota
//         await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -generatedImagesData.length } });

//         // Save the binary data of each image
//         const generatedImages = await GeneratedImage.insertMany(
//           generatedImagesData.map(binaryData => ({
//             image: binaryData, // Binary data of the image
//             userId: userId
//           }))
//         );

//         // Respond with the base64 strings
//         res.send({ imageUrls: base64Strings });
//       }, initialResponse.data.eta * 1000); // Convert ETA to milliseconds
//     } else {
//       // Handle other response statuses if needed
//       res.status(500).send({ message: "Unhandled response status from the API" });
//     }
//   } catch (error) {
//     console.error("Error during image generation:", error);
//     res.status(500).send({ message: "Internal server error" });
//   }
// });








// ... (existing code)
// app.post("/generate-image", async (req, res) => {
//   const { generatorType, promptText, negativePromptText, styleType, aspectRatio, scale, userId } = req.body;
// console.log("bodyrequest::::::", req.body)
//   try {
//     // Prepare headers and body for the Stable Diffusion API request
//     const apiHeaders = {
//       "Content-Type": "application/json",
//       // "Authorization": "Bearer YOUR_API_KEY", // Replace 'YOUR_API_KEY' with your actual API key
//     };

//     const apiBody = JSON.stringify({

//       "key": "0suXBgmo83crN2LystXdbOUv4q4MZwLCTEcHvqlPEUrjUWzuh8WbEyMBNysG",
//       "model_id": "sdxl",
//       "prompt": "ultra realistic close up portrait ((beautiful pale cyberpunk female with heavy black eyeliner)), blue eyes, shaved side haircut, hyper detail, cinematic lighting, magic neon, dark red city, Canon EOS R3, nikon, f/1.4, ISO 200, 1/160s, 8K, RAW, unedited, symmetrical balance, in-frame, 8K",
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
//       "track_id": null
//       // Add other necessary parameters for Stable Diffusion API
//     });

//     // Initial request to generate images
//     const initialResponse = await axios.post("https://stablediffusionapi.com/api/v4/dreambooth", apiBody, { headers: apiHeaders });

//     console.log(initialResponse)
//     if (initialResponse.data.status !== 'processing') {
//       throw new Error('Unexpected response status from the API');
//     }

//     // Wait for the ETA before making the fetch request
//     await new Promise(resolve => setTimeout(resolve, initialResponse.data.eta * 1100));
//     const apiBody2=JSON.stringify( {
//       "key": "0suXBgmo83crN2LystXdbOUv4q4MZwLCTEcHvqlPEUrjUWzuh8WbEyMBNysG", // Replace with your actual API key
//       "request_id": initialResponse.data.id.toString()
//     })
//     const fetchResponse = await axios.post(initialResponse.data.fetch_result.toString(),apiBody2, { headers: apiHeaders });
//     console.log(fetchResponse.data)

//     if (fetchResponse.data.status !== 'success') {
//       throw new Error('Failed to fetch generated images');
//     }

//     // Download each image and save its binary data
//     const generatedImagesData = await Promise.all(fetchResponse.data.output.map(async (url) => {
//       const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
//       return imageResponse.data; // This is the binary data of the image
//     }));
// console.log(generatedImagesData)
//     // Ensure the user exists and has image generation quota left
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }

//     if (user.no_of_images_left <= 0) {
//       return res.status(400).send({ message: "You have reached the image generation limit" });
//     }

//     // Update the user's image generation quota
//     await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -generatedImagesData.length } });

//     // Save the binary data of each image
//     const generatedImages = await GeneratedImage.insertMany(
//       generatedImagesData.map(binaryData => ({
//         image: binaryData, // Binary data of the image
//         userId: userId
//       }))
//     );

//     const imageBase64Strings = generatedImagesData.map(binaryData => {
//       return `data:image/jpeg;base64,${Buffer.from(binaryData).toString('base64')}`;
//     });

//     // Respond with the base64 encoded image data
//     res.send({ iymageUrls: imageBase64Strings });
//   } catch (error) {
//     console.error("Error during image generation:", error);
//     res.status(500).send({ message: "Internal server error" });
//   }
// });



// const upload = multer({ dest: 'uploads/' });

