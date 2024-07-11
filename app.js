const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables


const app = express();

// logger
const loggermiddleware = (req, res, next) => {
  const start = Date.now(); // Start timestamp
  
  res.on('finish', () => {
    const end = Date.now(); // End timestamp
    const duration = end - start;
    const currentTimestamp = new Date().toISOString();
    const status = res.statusCode;
    console.log(`[${currentTimestamp}] ${req.method} ${req.url} ${status} - ${duration}ms`);
  });
  
  next();
}

// Middleware to parse URL-encoded data and JSON data
app.use(loggermiddleware);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 


// Connect to MongoDB
const connectToMongoDB = require('./models/dbConfigure');
connectToMongoDB();

// Router linking
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
app.use('/users', userRouter);
app.use('/posts', postRouter);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
