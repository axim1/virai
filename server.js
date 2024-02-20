const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const path = require('path');
const { User, Subscription, GeneratedImage } = require('./models');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

// ... (existing code)

// Example of updating a route to use Mongoose syntax
app.post("/generate-image", async (req, res) => {
  const { generatorType, promptText, negativePromptText, styleType, aspectRatio, scale, userId } = req.body;

  try {
    // For demonstration, use Lorem Picsum for placeholder images
    const imageBuffers = await Promise.all([
      axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
      axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
      axios.get("https://picsum.photos/512/512", { responseType: 'arraybuffer' }),
    ]);

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
