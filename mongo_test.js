import mongoose from 'mongoose';

const uri = 'mongodb://mongo:HDiNmhmNGwDJDQEPpUQZWfurcuLVYCgx@hopper.proxy.rlwy.net:30701/ok11?authSource=admin';

async function updatePlayer() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) return;
  const collection = db.collection('players');
  const player = await collection.findOne();
  if (player) {
    console.log('Found player:', player);
    await collection.updateOne({ _id: player._id }, { $set: { imageUrl: 'https://cdn.ok11.in/test.jpg' } });
    console.log('Updated player image.');
  }
  await mongoose.disconnect();
}
updatePlayer();
