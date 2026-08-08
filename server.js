require("dotenv").config();

const app = require("./app");
const prisma = require("./config/db");


const PORT = process.env.PORT || 5000;



const startServer = async () => {

  try {

    await prisma.$connect();

    console.log("✅ Database connected successfully");


    app.listen(PORT, () => {

      console.log(`🚀 Server running on port ${PORT}`);

    });


  } catch(error) {

    console.error(
      "❌ Database connection failed:",
      error.message
    );

    process.exit(1);

  }

};



startServer();




// Graceful shutdown

const shutdown = async () => {

  console.log("Shutting down server...");


  await prisma.$disconnect();


  process.exit(0);

};



process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);