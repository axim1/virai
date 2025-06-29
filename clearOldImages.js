const mongoose = require('mongoose');
const { GeneratedImage } = require('./models');

const clearOldImages = async () => {
  try {
    const uri = "mongodb+srv://asim6832475:1234@cluster0.ukza83p.mongodb.net/?retryWrites=true&w=majority";
    const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

    await mongoose.connect(uri, clientOptions);
    console.log("Connected to MongoDB");

    const totalImages = await GeneratedImage.countDocuments();
    const imagesToDelete = Math.floor(totalImages * 0.8);
    const batchSize = 1000;
    let deletedCount = 0;

    console.log(`Preparing to delete ${imagesToDelete} images in batches...`);

    while (deletedCount < imagesToDelete) {
      const batch = await GeneratedImage.find({})
        .sort({ _id: 1 }) // ✅ No memory issue here
        .limit(Math.min(batchSize, imagesToDelete - deletedCount))
        .select('_id');

      if (batch.length === 0) break;

      const ids = batch.map(doc => doc._id);
      const result = await GeneratedImage.deleteMany({ _id: { $in: ids } });

      deletedCount += result.deletedCount;
      console.log(`Deleted ${result.deletedCount} (Total: ${deletedCount}/${imagesToDelete})`);
    }

    console.log("✅ Done deleting images.");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error deleting images:", error);
  }
};

if (require.main === module) {
  clearOldImages();
}
