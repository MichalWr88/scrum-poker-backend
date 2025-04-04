import { connections, ConnectionStates, connect } from "mongoose";
import "dotenv/config";
export async function initMongoDB(): Promise<void> {
  const { MONGO_USER, MONGO_PASSWORD, MONGO_CLUSTER, MONGO_DB_NAME } =
    process.env;
  if (!MONGO_USER || !MONGO_PASSWORD || !MONGO_CLUSTER || !MONGO_DB_NAME) {
    const errorMessage =
      "MONGO_USER or MONGO_PASSWORD or MONGO_CLUSTER or MONGO_DB_NAME not set";
    console.error("❌ " + errorMessage);
    throw new Error(errorMessage);
  }

  if (connections[0].readyState == ConnectionStates.connected) {
    console.log("Already connected to MongoDB");
    return;
  }
  try {
    const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DB_NAME}?retryWrites=true&w=majority`;
    await connect(connectionString, {
      // Additional options can be provided here if needed
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export default initMongoDB;
