import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import twilio from "twilio";
import callRoutes from "./routes/call.routes";
import path from "path";
import { CallService } from "./services/call.service";
import membershipRoutes from "./routes/membership.routes";
import userRoutes from "./routes/user.routes";
import campaignRoutes from "./routes/campaign.routes";
import businessRoutes from "./routes/business.routes";
import trainingRoutes from "./routes/training.routes";
import mongoose from "mongoose";
import contextRoutes from "./routes/context.routes";
import postRoutes from "./routes/post.routes";
import uploadRoutes from "./routes/upload.routes";
import auditionRoutes from "./routes/audition.routes";
import calendlyRoutes from "./routes/calendly.route";
import leadsRoutes from "./routes/leads.routes";
import accountExecutiveRoutes from "./routes/AE.routes";
import billingRoutes from "./routes/billing.routes";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const PORT = process.env.PORT || 8080;

const server = createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
CallService.initializeSocketIO(io);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/calls", callRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/user", userRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/contexts", contextRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auditions", auditionRoutes);
app.use("/api/calendly", calendlyRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/accountExecutive", accountExecutiveRoutes);
app.use("/api/billing", billingRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_PHONE_NUMBER
) {
  console.error("Twilio credentials are missing in environment variables");
  process.exit(1);
}

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-call", (callId: string) => {
    socket.join(`call-${callId}`);
    console.log(`Client ${socket.id} joined call ${callId}`);
  });

  socket.on("join-session", (sessionId: string) => {
    socket.join(`session-${sessionId}`);
    console.log(`Client ${socket.id} joined session ${sessionId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.get("/api/twilio/token", async (req, res) => {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const grant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity: "user-" + Math.random().toString(36).substring(2, 9) }
    );

    token.addGrant(grant);
    res.send({ token: token.toJwt() });
  } catch (error) {
    console.error("Error generating Twilio token:", error);
    res.status(500).json({ error: "Failed to generate Twilio token" });
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the Twilio Call App`);
});

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Disconnected from database");
  process.exit(0);
});
