const mongoose = require('mongoose');   // instance of mongoose
require('dotenv').config(); // load env vars

const connectToMongoDB = async () => {
    try {
      const uri = process.env.DB_URL;
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true
      };
      await mongoose.connect(uri, options);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
    }
};

module.exports = connectToMongoDB;