const mongoose = require('mongoose');
const { Subscription } = require('./models');

const fixSubscriptionFields = async () => {
  try {
    const uri = "mongodb+srv://asim6832475:1234@cluster0.ukza83p.mongodb.net/?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    
    console.log("🔍 Checking subscription documents for missing fields...");
    
    // Find subscriptions with missing fields
    const subscriptions = await Subscription.find();
    let updatedCount = 0;
    
    for (const sub of subscriptions) {
      const updates = {};
      
      // Add missing models3d field
      if (sub.models3d === undefined || sub.models3d === null) {
        // Set default values based on plan
        const defaultModels = {
          'FREE': 5,
          'STARTER': 20,
          'BUSINESS': 80,
          'PREMIUM': 160
        };
        updates.models3d = defaultModels[sub.name] || 0;
      }
      
      // Add missing coins field
      if (sub.coins === undefined || sub.coins === null) {
        const defaultCoins = {
          'FREE': 0,
          'STARTER': 50,
          'BUSINESS': 200,
          'PREMIUM': 400
        };
        updates.coins = defaultCoins[sub.name] || 0;
      }
      
      // Update if needed
      if (Object.keys(updates).length > 0) {
        await Subscription.findByIdAndUpdate(sub._id, updates);
        console.log(`✅ Updated ${sub.name}: ${JSON.stringify(updates)}`);
        updatedCount++;
      }
    }
    
    console.log(`🎉 Migration complete! Updated ${updatedCount} subscriptions.`);
    
    // Verify the fix
    console.log("\n📋 Current subscription data:");
    const verifySubscriptions = await Subscription.find();
    verifySubscriptions.forEach(sub => {
      console.log(`${sub.name}: models3d=${sub.models3d}, coins=${sub.coins}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the migration
fixSubscriptionFields(); 