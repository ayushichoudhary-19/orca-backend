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
import featureCategoryRoutes from "./routes/featureCategory.routes";
import featureRoutes from "./routes/feature.routes";
import roleRoutes from "./routes/role.routes";
import trainingRoutes from "./routes/training.routes";
import mongoose from 'mongoose';
import { TrainingModel } from "./models/Training";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize CallService with Socket.IO
CallService.initializeSocketIO(io);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/calls", callRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/user", userRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/featureCategory", featureCategoryRoutes);
app.use("/api/feature", featureRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/trainings", trainingRoutes);


// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


// Check for required environment variables
if (
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_PHONE_NUMBER
) {
  console.error("Twilio credentials are missing in environment variables");
  process.exit(1);
}

// Set up Socket.IO connection
io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);

  // Listen for client events
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

// Generate Twilio token for client
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

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the Twilio Call App`);
});

// Update shutdown handler
process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Disconnected from database");
  process.exit(0);
});
