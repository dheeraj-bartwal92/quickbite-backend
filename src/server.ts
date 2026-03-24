import "dotenv/config";
import { env } from "./config/env";
import app from "./app";
import { connectDB } from "./config/db";

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(
      `🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`,
    );
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
};

startServer();
