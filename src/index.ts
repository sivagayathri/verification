import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { processPendingAndNew } from "./streams/streamProcessor.js";
import { ensureGroup } from "./streams/helpers.js";
import { router as verificationRouter } from "./routes/verification.js";

dotenv.config();


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/api", verificationRouter);

const PORT = Number(process.env.PORT || 4000);
const server = app.listen(PORT, () => console.log(`Verification service listening on ${PORT}`));

(async () => {
  try {
    await ensureGroup();
    processPendingAndNew().catch((e) => console.error("Stream loop stopped:", e));
  } catch (err) {
    console.error("Failed to initialize stream consumer:", err);
    process.exit(1);
  }
})();


process.on("SIGINT", async () => {
  console.log("Shutting down verification service...");
  server.close();
  process.exit(0);
});
