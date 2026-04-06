const mongoose = require("mongoose");
const seedAdmin = require("./seeder");
const seedContent = require("./contentSeeder");

const connetDb = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    if (db) {
      console.log("Database Connected");
      seedAdmin();
      seedContent();
    }
  } catch (error) {
    console.log("Connection failed", error.message);
  }
};

module.exports = connetDb;
