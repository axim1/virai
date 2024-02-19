const mongoose = require('mongoose');
const { User, Subscription, GeneratedImage } = require('./models');

const seedDatabase = async () => {
  try {
    const uri = "mongodb+srv://asim6832475:1234@cluster0.ukza83p.mongodb.net/?retryWrites=true&w=majority";
    const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

    await mongoose.connect(uri, clientOptions);

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Subscription.deleteMany(),
      GeneratedImage.deleteMany(),
    ]);

    const subscriptionsData = [
      {
        name: "FREE",
        priceMonthly: 0,
        priceYearly: 0,
        generatedImages: 200,
        generationSpeed: "Slow",
        videoGenerations: 10,
        licenseType: "Personal use only",
        privacy: "Images are open to public",
      },
      {
        name: "STARTER",
        priceMonthly: 8,
        priceYearly: 80,
        generatedImages: 1200,
        generationSpeed: "Slow",
        videoGenerations: 40,
        licenseType: "Personal use only",
        privacy: "Images are open to public",
      },
      {
        name: "BUSINESS",
        priceMonthly: 24,
        priceYearly: 240,
        generatedImages: 4800,
        generationSpeed: "Fast",
        videoGenerations: 160,
        licenseType: "Commercial license",
        privacy: "Images are kept private",
      },
      {
        name: "PREMIUM",
        priceMonthly: 48,
        priceYearly: 480,
        generatedImages: 9600,
        generationSpeed: "Fast",
        videoGenerations: 320,
        licenseType: "Commercial license",
        privacy: "Images are kept private",
      },
    ];

    const subscriptions = await Subscription.insertMany(subscriptionsData);

    const usersData = [
      {
        fname: "John",
        lname: "Doe",
        email: "john@example.com",
        password: "123",
        no_of_images_left: 200,
        subscribed_monthly: true,
        subscribed_yearly: false,
        subscription: subscriptions[0]._id, // Fix: use subscription instead of subscriptionId
      },
      // ... (other user data)
    ];

    const users = await User.insertMany(usersData);

    const generatedImagesData = [
      {
        image: Buffer.from('base64_image_data', 'base64'),
        userId: users[0]._id,
      },
      // ... (other generated image data)
    ];

    await GeneratedImage.insertMany(generatedImagesData);

    // Disconnect from the database after seeding
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Run the seed function when this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
