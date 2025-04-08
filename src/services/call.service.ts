import { Twilio } from "twilio";
import { PrismaClient, CallOutcome, LeadStatus } from "@prisma/client";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
import twilio from "twilio";

export const prisma = new PrismaClient();

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "";

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error(
    "Twilio credentials are not properly configured in .env file"
  );
}

const twilioClient = new Twilio(accountSid, authToken);

export enum CallStatus {
  INITIATED = "initiated",
  RINGING = "ringing",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  BUSY = "busy",
  FAILED = "failed",
  NO_ANSWER = "no-answer",
  CANCELED = "canceled",
  QUEUED = "queued",
  HOLDING = "holding",
}

// Socket.io instance to be initialized from the main server
let io: SocketServer;

export class CallService {
  /**
   * Initialize the socket.io instance
   * @param socketIo - The socket.io server instance
   */
  static initializeSocketIO(socketIo: SocketServer) {
    io = socketIo;
  }

  static async createCallRecord({
    id,
    to,
    from,
    status,
  }: {
    id: string;
    to: string;
    from: string;
    status: CallStatus;
  }) {
    try {
      const call = await prisma.call.create({
        data: {
          id,
          to,
          from,
          status,
        },
      });
      return call;
    } catch (error) {
      console.error("Error in createCallRecord:", error);
      throw new Error("Failed to create call record");
    }
  }

  /**
   * Start a sequential call session with multiple phone numbers
   * @param phoneNumbers - Array of phone numbers to call in sequence
   * @param from - The phone number to call from
   * @param script - Optional script for the calls
   * @returns The call session details
   */
  static async startCallSession(
    phoneNumbers: string[],
    from: string = twilioPhoneNumber,
    script?: string
  ) {
    try {
      // Create a new call session
      const session = await prisma.callSession.create({
        data: {
          phoneNumbers,
          currentIndex: 0,
          isComplete: false,
        },
      });

      // Make the first call
      if (phoneNumbers.length > 0) {
        const firstNumber = phoneNumbers[0];
        const call = await twilioClient.calls.create({
          url: `${process.env.BASE_URL}/api/calls/connect`,
          to: firstNumber,
          from: twilioPhoneNumber,
          record: true,
          statusCallback: `${process.env.BASE_URL}/api/calls/status-callback`,
          statusCallbackEvent: [
            "initiated",
            "ringing",
            "answered",
            "completed",
          ],
          statusCallbackMethod: "POST",
        });

        const callRecord = await prisma.call.create({
          data: {
            id: call.sid,
            from,
            to: firstNumber,
            status: CallStatus.INITIATED,
            script: script || null,
            notes: "",
            sessionId: session.id,
            sequenceIndex: 0,
          },
        });

        // Emit call initiated event
        if (io) {
          io.emit("call-session-update", {
            sessionId: session.id,
            currentIndex: 0,
            totalCalls: phoneNumbers.length,
            currentCall: {
              callSid: call.sid,
              callId: callRecord.id,
              status: CallStatus.INITIATED,
              to: firstNumber,
              from,
            },
          });
        }

        return { session, currentCall: callRecord };
      }

      return { session, currentCall: null };
    } catch (error) {
      console.error("Error starting call session:", error);
      throw error;
    }
  }

  /**
   * Proceed to the next call in a session after feedback
   * @param sessionId - The call session ID
   * @param currentCallId - The current call ID
   * @param feedback - Feedback for the current call
   * @param from - The phone number to call from
   * @param script - Optional script for the call
   * @returns The next call details or null if session is complete
   */
  static async proceedToNextCall(
    sessionId: string,
    currentCallId: string,
    feedback: {
      callOutcome: CallOutcome;
      leadStatus?: LeadStatus;
      notes?: string;
    },
    from: string = twilioPhoneNumber,
    script?: string
  ) {
    try {
      await prisma.feedback.create({
        data: {
          callOutcome: feedback.callOutcome,
          leadStatus: feedback.leadStatus || null,
          notes: feedback.notes || null,
          callId: currentCallId,
        },
      });

      // Get the session
      const session = await prisma.callSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error("Call session not found");
      }

      // Check if there are more calls to make
      const nextIndex = session.currentIndex + 1;
      if (nextIndex >= session.phoneNumbers.length) {
        // Mark session as complete
        await prisma.callSession.update({
          where: { id: sessionId },
          data: { isComplete: true },
        });

        // Emit session complete event
        if (io) {
          io.emit("call-session-complete", {
            sessionId,
            totalCalls: session.phoneNumbers.length,
          });
        }

        return null;
      }

      // Update session current index
      await prisma.callSession.update({
        where: { id: sessionId },
        data: { currentIndex: nextIndex },
      });

      // Make the next call
      const nextNumber = session.phoneNumbers[nextIndex];
      const call = await twilioClient.calls.create({
        url: `${process.env.BASE_URL}/api/calls/connect`,
        to: nextNumber,
        from: twilioPhoneNumber,
        record: true,
        statusCallback: `${process.env.BASE_URL}/api/calls/status-callback`,
        statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
        statusCallbackMethod: "POST",
      });

      // Create the call record with session ID
      const callRecord = await prisma.call.create({
        data: {
          id: call.sid,
          from,
          to: nextNumber,
          status: CallStatus.INITIATED,
          script: script || null,
          notes: "",
          sessionId,
          sequenceIndex: nextIndex,
        },
      });

      // Emit next call event
      if (io) {
        io.emit("call-session-update", {
          sessionId,
          currentIndex: nextIndex,
          totalCalls: session.phoneNumbers.length,
          currentCall: {
            callSid: call.sid,
            callId: callRecord.id,
            status: CallStatus.INITIATED,
            to: nextNumber,
            from,
          },
        });
      }

      return callRecord;
    } catch (error) {
      console.error("Error proceeding to next call:", error);
      throw error;
    }
  }

  static async updateCallWithNotes(callId: string, notes: string) {
    return prisma.call.update({
      where: { id: callId },
      data: { notes },
    });
  }

  static async handleCallConnection(callSid: string, to: string) {
    // Return TwiML that connects this call to the recipient (once)
    return `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial callerId="${twilioPhoneNumber}">
          <Number>${to}</Number>
        </Dial>
      </Response>`;
  }

  /**
   * Handle call status updates from Twilio webhooks
   * @param callSid - The Twilio call SID
   * @param status - The call status
   * @param duration - The call duration (optional)
   * @param recordingUrl - The recording URL (optional)
   * @returns The updated call details
   */
  static async handleCallStatusUpdate(
    callSid: string,
    status: string,
    duration?: number,
    recordingUrl?: string
  ) {
    try {
      // Find the call by SID stored in notes
      const call = await prisma.call.findFirst({
        where: {
          notes: { contains: callSid },
        },
        include: {
          session: true,
        },
      });

      if (!call) {
        console.warn(`Call with SID ${callSid} not found in database`);
        return null;
      }

      // Map Twilio status to our status enum
      let mappedStatus: CallStatus;
      switch (status.toLowerCase()) {
        case "queued":
          mappedStatus = CallStatus.QUEUED;
          break;
        case "ringing":
          mappedStatus = CallStatus.RINGING;
          break;
        case "in-progress":
          mappedStatus = CallStatus.IN_PROGRESS;
          break;
        case "completed":
          mappedStatus = CallStatus.COMPLETED;
          break;
        case "busy":
          mappedStatus = CallStatus.BUSY;
          break;
        case "failed":
          mappedStatus = CallStatus.FAILED;
          break;
        case "no-answer":
          mappedStatus = CallStatus.NO_ANSWER;
          break;
        case "canceled":
          mappedStatus = CallStatus.CANCELED;
          break;
        default:
          mappedStatus = status as CallStatus;
      }

      // Update the call in the database
      const updatedCall = await prisma.call.update({
        where: { id: call.id },
        data: {
          status: mappedStatus,
          ...(duration !== undefined && { duration }),
          ...(recordingUrl && { recordingUrl }),
        },
        include: {
          session: true,
        },
      });

      // Emit call status update event
      if (io) {
        io.emit("call-status-update", {
          callSid,
          callId: call.id,
          status: mappedStatus,
          to: call.to,
          from: call.from,
          duration,
          recordingUrl,
        });

        // If this call is part of a session, emit session update
        if (call.sessionId) {
          io.emit("call-session-update", {
            sessionId: call.sessionId,
            currentIndex: call.sequenceIndex || 0,
            totalCalls: call.session?.phoneNumbers.length || 0,
            currentCall: {
              callSid,
              callId: call.id,
              status: mappedStatus,
              to: call.to,
              from: call.from,
              duration,
              recordingUrl,
            },
          });
        }
      }

      return updatedCall;
    } catch (error) {
      console.error("Error handling call status update:", error);
      throw error;
    }
  }

  // Save call feedback
  static async saveFeedback(
    callId: string,
    feedbackData: {
      callOutcome: CallOutcome;
      leadStatus?: LeadStatus;
      notes?: string | null;
    }
  ) {
    try {
      // First check if the call exists
      const callExists = await prisma.call.findUnique({
        where: { id: callId },
      });

      if (!callExists) {
        throw new Error(`Call with ID ${callId} not found`);
      }

      const savedFeedback = await prisma.feedback.create({
        data: {
          callOutcome: feedbackData.callOutcome,
          leadStatus: feedbackData.leadStatus || null,
          notes: feedbackData.notes || null,
          callId,
        },
      });

      const call = await prisma.call.findUnique({
        where: { id: callId },
        include: { session: true },
      });

      if (call?.sessionId && io) {
        io.emit("call-feedback-received", {
          callId,
          sessionId: call.sessionId,
          feedback: savedFeedback,
        });
      }

      return savedFeedback;
    } catch (error) {
      console.error("Error saving feedback:", error);
      throw new Error(
        error instanceof Error ? error.message : "Error saving feedback"
      );
    }
  }

  /**
   * Get all calls from the database
   * @returns List of calls
   */
  static async getAllCalls() {
    return prisma.call.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        feedback: true,
        session: true,
      },
    });
  }

  /**
   * Get a specific call by ID
   * @param id - The call ID
   * @returns The call details
   */
  static async getCallById(id: string) {
    return prisma.call.findUnique({
      where: { id },
      include: {
        feedback: true,
        session: true,
      },
    });
  }

  /**
   * Get a call session by ID
   * @param id - The session ID
   * @returns The session details with calls
   */
  static async getCallSessionById(id: string) {
    return prisma.callSession.findUnique({
      where: { id },
      include: {
        calls: {
          orderBy: {
            sequenceIndex: "asc",
          },
          include: {
            feedback: true,
          },
        },
      },
    });
  }

  /**
   * Get all call sessions
   * @returns List of call sessions with calls
   */
  static async getAllCallSessions() {
    return prisma.callSession.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        calls: {
          orderBy: {
            sequenceIndex: "asc",
          },
          include: {
            feedback: true,
          },
        },
      },
    });
  }

  /**
   * Update call status
   * @param id - The call ID
   * @param status - The new status
   * @param duration - The call duration (optional)
   * @param recordingUrl - The recording URL (optional)
   * @returns The updated call details
   */
  static async updateCallStatus(
    id: string,
    status: string,
    duration?: number,
    recordingUrl?: string
  ) {
    return prisma.call.update({
      where: { id },
      data: {
        status,
        ...(duration && { duration }),
        ...(recordingUrl && { recordingUrl }),
      },
    });
  }

  /**
   * End a call
   * @param callSid - The Twilio call SID
   * @returns Success status
   */
  static async endCall(callSid: string) {
    try {
      // End the call via Twilio API
      await twilioClient.calls(callSid).update({
        status: "completed",
      } as any);
      
      // Find the call in our database
      const call = await prisma.call.findFirst({
        where: {
          notes: { contains: callSid },
        },
      });

      if (call) {
        // Update our database
        await prisma.call.update({
          where: { id: call.id },
          data: {
            status: CallStatus.COMPLETED,
          },
        });

        // Emit call ended event
        if (io) {
          io.emit("call-ended", {
            callSid,
            callId: call.id,
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error ending call:", error);
      throw error;
    }
  }

  /**
   * Generate a Twilio token for client-side usage
   * @returns The generated token
   */
  static async generateToken() {
    try {
      const AccessToken = twilio.jwt.AccessToken;
      const VoiceGrant = AccessToken.VoiceGrant;

      // Create an access token
      const accessToken = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID || "",
        process.env.TWILIO_API_KEY!,
        process.env.TWILIO_API_SECRET!,
        { identity: "user-" + Math.random().toString(36).substring(7) }
      );

      // Create a Voice grant and add it to the token
      const voiceGrant = new VoiceGrant({
        outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
        incomingAllow: true,
      });

      accessToken.addGrant(voiceGrant);

      // Set the identity of the token
      accessToken.identity = "user-" + Math.random().toString(36).substring(7);

      // Generate the token
      return accessToken.toJwt();
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  }
}
