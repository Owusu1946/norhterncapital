import connectDB from "../lib/mongodb";
import RoomType from "../models/RoomType";

const roomTypes = [
  {
    slug: "signature-suite",
    name: "Signature Suite",
    description: "Expansive suite with skyline views, lounge area, and private balcony.",
    longDescription: "Our Signature Suite is designed for guests who want generous space, quiet luxury, and a calm place to unwind after a day in Tamale and Savelugu.",
    pricePerNight: 320,
    size: "52 m²",
    bedType: "King bed",
    maxGuests: 3,
    maxAdults: 2,
    maxChildren: 1,
    totalRooms: 5,
    amenities: [
      "Separate lounge area",
      "Private balcony",
      "Complimentary breakfast",
      "Smart TV",
      "High-speed Wi-Fi",
      "In-room safe",
      "Mini bar",
    ],
    perks: ["City view", "King bed", "Breakfast included"],
    mainImage: "/hero.jpg",
    gallery: ["/hero.jpg", "/hero.jpg", "/hero.jpg"],
    isActive: true,
  },
  {
    slug: "deluxe-room",
    name: "Deluxe Room",
    description: "Comfortable room with warm tones, perfect for business or leisure.",
    longDescription: "Thoughtfully designed for business travellers and city explorers, our Deluxe Room balances comfort with functionality.",
    pricePerNight: 210,
    size: "32 m²",
    bedType: "Queen bed",
    maxGuests: 2,
    maxAdults: 2,
    maxChildren: 0,
    totalRooms: 10,
    amenities: [
      "Dedicated work desk",
      "Rain shower",
      "High-speed Wi-Fi",
      "Tea and coffee set-up",
      "Smart TV",
      "Air conditioning",
    ],
    perks: ["Work desk", "Rain shower", "High-speed Wi-Fi"],
    mainImage: "/hero.jpg",
    gallery: ["/hero.jpg", "/hero.jpg", "/hero.jpg"],
    isActive: true,
  },
  {
    slug: "family-room",
    name: "Family Room",
    description: "Spacious layout with flexible bedding for small families or groups.",
    longDescription: "Ideal for small families and close groups, our Family Room offers flexible bedding and extra space so everyone can settle in comfortably.",
    pricePerNight: 260,
    size: "40 m²",
    bedType: "King bed + sofa bed",
    maxGuests: 4,
    maxAdults: 2,
    maxChildren: 2,
    totalRooms: 8,
    amenities: [
      "Sofa bed",
      "Kids-friendly layout",
      "Late checkout (subject to availability)",
      "Smart TV",
      "High-speed Wi-Fi",
      "Tea and coffee set-up",
    ],
    perks: ["Sofa bed", "Kids-friendly", "Late checkout"],
    mainImage: "/hero.jpg",
    gallery: ["/hero.jpg", "/hero.jpg", "/hero.jpg"],
    isActive: true,
  },
];

async function seedRoomTypes() {
  try {
    console.log("🌱 Starting room types seeding...");
    
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Clear existing room types (optional)
    const existingCount = await RoomType.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  Found ${existingCount} existing room types. Skipping seed.`);
      console.log("   To reseed, manually delete existing room types first.");
      process.exit(0);
    }

    // Insert room types
    for (const roomTypeData of roomTypes) {
      const roomType = await RoomType.create(roomTypeData);
      console.log(`✅ Created room type: ${roomType.name} (${roomType.slug})`);
    }

    console.log(`\n🎉 Successfully seeded ${roomTypes.length} room types!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding room types:", error);
    process.exit(1);
  }
}

// Run the seed function
seedRoomTypes();
