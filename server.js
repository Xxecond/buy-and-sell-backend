require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const productRoutes = require('./routes/productRoutes')
const OrderRoutes = require('./routes/orderRoutes');


const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later"
})


// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "https://buy-and-sell-nu.vercel.app"],
  credentials:true
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(limiter)

//API ROUTES
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', OrderRoutes);

app.use(errorHandler);

// START SERVER
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully")

  app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  });
}
 catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
};
startServer();

//CLEAN SHUTDOWN
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
