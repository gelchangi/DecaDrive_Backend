// MongoDB connection helper using native driver
// Exports: connectToDatabase(), getDb(), getClient()
const { MongoClient } = require("mongodb");

let client = null;
let db = null;

async function connectToDatabase() {
  if (db) return { client, db };
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set in environment");

  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  // Default DB is the one specified in the connection string
  db = client.db("DecaDrive");
  console.log("Connected to MongoDB");
  return { client, db };
}

function getDb() {
  if (!db)
    throw new Error("Database not connected. Call connectToDatabase first.");
  return db;
}

function getClient() {
  if (!client)
    throw new Error("MongoClient not connected. Call connectToDatabase first.");
  return client;
}

module.exports = { connectToDatabase, getDb, getClient };
