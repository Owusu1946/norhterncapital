const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://okenneth:Kwabenapwusu2255@northerncapital.leqnabr.mongodb.net/';

const RoomTypeSchema = new mongoose.Schema({
    slug: { type: String, required: true },
    name: { type: String, required: true },
    mainImage: String,
    gallery: [String],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const RoomType = mongoose.models.RoomType || mongoose.model('RoomType', RoomTypeSchema);

async function checkImages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const roomTypes = await RoomType.find({}).lean();
        console.log(`Found ${roomTypes.length} room types.`);

        roomTypes.forEach(rt => {
            console.log(`\nRoom: ${rt.name} (${rt.slug})`);
            console.log(`  Main Image: "${rt.mainImage}"`);
            console.log(`  Gallery: ${JSON.stringify(rt.gallery)}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

checkImages();
