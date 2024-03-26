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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const fs = require('fs');

const uri = "mongodb+srv://asim6832475:1234@cluster0.ukza83p.mongodb.net/?retryWrites=true&w=majority";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };


mongoose.connect(uri, clientOptions)
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Error connecting to MongoDB:", error));



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


// Example of updating a route to use Mongoose syntax
app.post("/api/signup", async (req, res) => {
  const { fname, lname, email, password, subscriptionName } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res.send({ message: "User is already registered" });
    } else {
      const subscription = await Subscription.findOne({ name: subscriptionName });
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
          subscriptionId: subscription.id,
        });

        res.send({ message: "Account has been created!! Please Login", user: newUser });
      }
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send({ message: "Internal server error", error: error.message });
  }
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
//     res.send({ imageUrls: imageBase64Strings });
//   } catch (error) {
//     console.error("Error during image generation:", error);
//     res.status(500).send({ message: "Internal server error" });
//   }
// });



// const upload = multer({ dest: 'uploads/' });

app.post('/sketch-to-image', upload.single('sketch_image'), async (req, res) => {
  try {
    const sketchImagePath = req.file.path; // Path to the uploaded sketch image
    const form = new FormData();
    // form.append('sketch_image', fs.createReadStream(sketchImagePath), req.file.originalname);

    // for (let [key, value] of form.entries()) {
    //   console.log(`${key}: ${value}`);
    // }
    console.log(req.body.prompt); // Should log "cat"
    console.log(req.body.sketch_image_uuid);
    // Append parameters to form data
    if (!req.file) {
      return res.status(400).send({ message: 'No sketch image provided' });
  }



  // Append text fields
  form.append('strength', '0.8');
  form.append('guidance_scale', '7.5');
  form.append('prompt', req.body.prompt || 'high quality interior'); // Use the prompt from the request or a default value
  form.append('width', '512');
  form.append('height', '512');
  form.append('steps', '25');
  form.append('safetensor', 'false');
  form.append('model_xl', 'false');
  form.append('negative_prompt', req.body.negativePrompt || 'two faces, black man, duplicate, copy, multi, two, disfigured, kitsch, ugly, oversaturated, contrast, grain, low resolution, deformed, blurred, bad anatomy, disfigured, badly drawn face, mutation, mutated, extra limb, ugly, bad holding object, badly drawn arms, missing limb, blurred, floating limbs, detached limbs, deformed arms, blurred, out of focus, long neck, long body, ugly, disgusting, badly drawn, childish, disfigured, disfigured, old ugly, tile, badly drawn arms, badly drawn legs, badly drawn face, out of frame, extra limbs, disfigured, deformed, body out of frame, blurred, bad anatomy, blurred, watermark, grainy, signature, clipped, draftbird view, bad proportion, hero, cropped image'); // Long string as in the example
  form.append('clip_skip', '0');
  form.append('num_images', '1');
  form.append('style', 'default');
  form.append('seed', ''); // Empty string or any specific value if needed
  form.append('sketch_image_uuid', '456'); // Example UUID, replace with actual if available
  form.append('revert_extra', ''); // Empty string or any specific value if needed
  form.append('callback_url', ''); // Empty string or any specific value if needed
  form.append('maintain_aspect_ratio', 'false');
  form.append('scheduler', 'Default');

  // Append the file
  form.append('sketch_image', fs.createReadStream(sketchImagePath), req.file.originalname);

    // First API call to generate the image
    const sketch2imageResponse = await axios.post('http://34.231.176.149:8888/sketch2image', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    console.log(sketch2imageResponse.data);

    const imageUuid = sketch2imageResponse.data.images[0].image_uuid;
console.log("image uuid", imageUuid )
const delayInSeconds = 10; // Adjust the delay as needed
await new Promise(resolve => setTimeout(resolve, delayInSeconds * 1000));

    // Second API call to retrieve the generated image using the UUID
    const response = await axios.get(`http://34.231.176.149:8888/getimage/${imageUuid}`, {
      params: {
        delete: true,
        type: 'PNG',
        base64_c: false,
        quality_level: 90,
      },
      headers: {
        'accept': 'application/json'
      },
      responseType: 'arraybuffer' // If you expect a binary image response
    });
console.log(response.data)
    // Convert binary data to base64 string if needed
    const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;


    res.send({ imageUrls: imageDataUrl });
  } catch (error) {
    // console.error('Error during sketch to image process:', error);
    if (error.response) {
      console.error('Error details:', error.response.data.detail);
    }
    
    res.status(500).send({ message: 'Internal server error' });
  }
});



// Example of updating a route to use Mongoose syntax
app.post("/generate-image", async (req, res) => {
  console.log(req.body); // Now req.body should be populated with your JSON data.
  const form = new FormData();
  for (let [key, value] of form.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  const { generatorType, promptText, negativePromptText, styleType, aspectRatio, scale, userId } = req.body;

  try {
    // For demonstration, use Lorem Picsum for placeholder images

console.log("bodyrequest::::::", req.body)

    // Prepare headers and body for the Stable Diffusion API request
    const apiHeaders = {
      "Content-Type": "application/json",
      // "Authorization": "Bearer YOUR_API_KEY", // Replace 'YOUR_API_KEY' with your actual API key
    };

    const apiBody = JSON.stringify({

      "key": "0suXBgmo83crN2LystXdbOUv4q4MZwLCTEcHvqlPEUrjUWzuh8WbEyMBNysG",
      "model_id": "sdxl",
      "prompt": promptText,
      "negative_prompt": negativePromptText,
      "width": "512",
      "height": "512",
      "samples": "1",
      "num_inference_steps": "30",
      "safety_checker": "no",
      "enhance_prompt": "yes",
      "seed": null,
      "guidance_scale": 7.5,
      "multi_lingual": "no",
      "panorama": "no",
      "self_attention": "no",
      "upscale": "no",
      "embeddings_model": null,
      "lora_model": null,
      "tomesd": "yes",
      "clip_skip": "2",
      "use_karras_sigmas": "yes",
      "vae": null,
      "lora_strength": null,
      "scheduler": "UniPCMultistepScheduler",
      "webhook": null,
      "track_id": null,
      // "base64":"yes"
      // Add other necessary parameters for Stable Diffusion API
    });
    console.log("running api ")

    // Initial request to generate images
    const initialResponse = await axios.post("https://stablediffusionapi.com/api/v4/dreambooth", apiBody, { headers: apiHeaders });

console.log(initialResponse.data.future_links)

//     if (initialResponse.data.status == 'processing') {
//       throw new Error('Unexpected response status from the API');
//     }
let imageBuffers=[]; // Define imageBuffers here to have a broader scope

if (initialResponse.data.status == 'success') {
   imageBuffers = await Promise.all([
    // axios.get("https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/generations/0-2bf46a60-4485-4aa6-89d7-492fc75d4676.png", { responseType: 'arraybuffer' }),
    axios.get(initialResponse.data.output, { responseType: 'arraybuffer' }),
    // axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
  ]);}
 else if (initialResponse.data.status == 'processing') {

      await new Promise(resolve => setTimeout(resolve, initialResponse.data.eta * 3000));
      const futureLink = initialResponse.data.future_links[0]; // Example: accessing the first link
console.log("future bright he:",futureLink)
     imageBuffers = await Promise.all([
      axios.get(futureLink,{ responseType: 'arraybuffer' }),

    ]);}

    console.log(imageBuffers)
    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found. UserId:", userId);
      res.status(404).send({ message: "User not found" });
      return;
    }

    if (user.no_of_images_left <= 0) {
      return res.status(400).send({ message: "You have reached the image generation limit" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { no_of_images_left: -1 } });

    if (!updatedUser) {
      console.log("Error updating user:", updatedUser);
      return res.status(500).send({ message: "Error updating user" });
    }

    const generatedImages = await GeneratedImage.insertMany(
      imageBuffers.map((response) => ({ image: response.data, userId: user.id }))
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
