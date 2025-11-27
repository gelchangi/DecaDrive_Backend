// Seed script for DecaDrive lessons collection
// Usage:
//   MONGO_URI="..." node scripts/seed.js

const { MongoClient } = require("mongodb");
require("dotenv").config();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not provided. Set env or pass as CLI arg.");
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  const db = client.db("DecaDrive");

  const lessons = [
    {
      subject: "Manual Beginner",
      location: "Flic en Flac",
      price: 20,
      spaces: 8,
      description: "Introductory manual driving course for beginners.",
      image:
        "https://images.pexels.com/photos/7036818/pexels-photo-7036818.jpeg",
    },
    {
      subject: "Manual Intermediate",
      location: "Flic en Flac",
      price: 22,
      spaces: 6,
      description: "Build on basics with maneuvers and traffic rules.",
      image:
        "https://images.pexels.com/photos/5215655/pexels-photo-5215655.jpeg",
    },
    {
      subject: "Automatic Beginner",
      location: "Port Louis",
      price: 18,
      spaces: 10,
      description: "Automatic transmission lessons for new drivers.",
      image:
        "https://images.pexels.com/photos/2986849/pexels-photo-2986849.jpeg",
    },
    {
      subject: "Night Driving Practice",
      location: "Port Louis",
      price: 30,
      spaces: 4,
      description: "Practice driving safely at night with an instructor.",
      image: "https://images.pexels.com/photos/754147/pexels-photo-754147.jpeg",
    },
    {
      subject: "Highway Confidence",
      location: "Grand Baie",
      price: 28,
      spaces: 5,
      description: "Get confident driving on highways and fast roads.",
      image: "https://images.pexels.com/photos/967072/pexels-photo-967072.jpeg",
    },
    {
      subject: "Mock Test",
      location: "Grand Baie",
      price: 35,
      spaces: 3,
      description: "Mock practical driving test to prepare for the real exam.",
      image:
        "https://images.pexels.com/photos/7144191/pexels-photo-7144191.jpeg",
    },
    {
      subject: "Parking & Reversing",
      location: "Curepipe",
      price: 15,
      spaces: 12,
      description: "Master parking maneuvers and reversing techniques.",
      image:
        "https://images.pexels.com/photos/28926633/pexels-photo-28926633.jpeg",
    },
    {
      subject: "Clutch Control Mastery",
      location: "Quatre Bornes",
      price: 20,
      spaces: 7,
      description: "Fine tune clutch control for smooth starts and stops.",
      image:
        "https://images.pexels.com/photos/14909211/pexels-photo-14909211.jpeg",
    },
    {
      subject: "Defensive Driving",
      location: "Beau Bassin",
      price: 25,
      spaces: 6,
      description: "Learn defensive techniques to avoid accidents.",
      image:
        "https://images.pexels.com/photos/6365082/pexels-photo-6365082.jpeg",
    },
    {
      subject: "Intensive 5-hr Course",
      location: "All Locations",
      price: 80,
      spaces: 2,
      description: "Focused intensive training over 5 hours.",
      image:
        "https://images.pexels.com/photos/16763244/pexels-photo-16763244.jpeg",
    },
  ];

  const lessonsCol = db.collection("lessons");
  // Clear existing lessons
  await lessonsCol.deleteMany({});
  const result = await lessonsCol.insertMany(lessons);
  console.log(`Inserted ${result.insertedCount} lessons`);
  console.log("IDs:", Object.values(result.insertedIds));

  await client.close();
}

run().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
