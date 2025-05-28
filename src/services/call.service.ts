import { Twilio } from "twilio";
import { Server as SocketServer } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Call, CallSession } from "../models/Call";
import { Feedback } from "../models/Feedback";
import { Lead } from "../models/Lead";
import twilio from "twilio";

dotenv.config();

const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;
let io: SocketServer;

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

export class CallService {
  static initializeSocketIO(socketIo: SocketServer) {
    io = socketIo;
  }

  static async createCallRecord({
    id,
    to,
    from,
    status,
    campaignId,
    salesRepId,
  }: {
    id: string;
    to: string;
    from: string;
    status: CallStatus;
    campaignId: string;
    salesRepId: string;
  }) {
    const lead = await Lead.findOne({ campaignId, phone: to });
    return await Call.create({
      _id: id,
      to,
      from,
      status,
      campaignId: new mongoose.Types.ObjectId(campaignId),
      salesRepId,
      leadId: lead?._id,
    });
  }
  static async startCallSession(
    phoneNumbers: string[],
    from: string = twilioPhoneNumber,
    script?: string
  ) {
    const session = await CallSession.create({
      phoneNumbers,
      currentIndex: 0,
      isComplete: false,
    });

    if (phoneNumbers.length === 0) return { session, currentCall: null };

    const firstNumber = phoneNumbers[0];
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL}/api/calls/connect`,
      to: firstNumber,
      from,
      record: true,
      statusCallback: `${process.env.BASE_URL}/api/calls/status-callback`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    const callRecord = await Call.create({
      _id: call.sid,
      from,
      to: firstNumber,
      status: CallStatus.INITIATED,
      script: script || null,
      notes: "",
      sessionId: session._id,
      sequenceIndex: 0,
    });

    if (io) {
      io.emit("call-session-update", {
        sessionId: session._id,
        currentIndex: 0,
        totalCalls: phoneNumbers.length,
        currentCall: {
          callSid: call.sid,
          callId: callRecord._id,
          status: CallStatus.INITIATED,
          to: firstNumber,
          from,
        },
      });
    }

    return { session, currentCall: callRecord };
  }

  static async proceedToNextCall(
    sessionId: string,
    currentCallId: string,
    feedback: {
      feedbackReason: string;
      notes?: string;
    },
    from: string = twilioPhoneNumber,
    script?: string
  ) {
    await Feedback.create({
      feedbackReason: feedback.feedbackReason,
      notes: feedback.notes || null,
      callId: currentCallId,
    });

    const session = await CallSession.findById(sessionId);
    if (!session) throw new Error("Call session not found");

    const nextIndex = session.currentIndex + 1;
    if (nextIndex >= session.phoneNumbers.length) {
      session.isComplete = true;
      await session.save();

      io?.emit("call-session-complete", {
        sessionId,
        totalCalls: session.phoneNumbers.length,
      });
      return null;
    }

    session.currentIndex = nextIndex;
    await session.save();

    const nextNumber = session.phoneNumbers[nextIndex];
    const call = await twilioClient.calls.create({
      url: `${process.env.BASE_URL}/api/calls/connect`,
      to: nextNumber,
      from,
      record: true,
      statusCallback: `${process.env.BASE_URL}/api/calls/status-callback`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",
    });

    const callRecord = await Call.create({
      _id: call.sid,
      from,
      to: nextNumber,
      status: CallStatus.INITIATED,
      script: script || null,
      notes: "",
      sessionId,
      sequenceIndex: nextIndex,
    });

    io?.emit("call-session-update", {
      sessionId,
      currentIndex: nextIndex,
      totalCalls: session.phoneNumbers.length,
      currentCall: {
        callSid: call.sid,
        callId: callRecord._id,
        status: CallStatus.INITIATED,
        to: nextNumber,
        from,
      },
    });

    return callRecord;
  }

  static async handleCallConnection(callSid: string, to: string) {
    return `<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Dial callerId=\"${twilioPhoneNumber}\"><Number>${to}</Number></Dial></Response>`;
  }

  static async handleCallStatusUpdate(
    callSid: string,
    status: string,
    duration?: number,
    recordingUrl?: string
  ) {
    const call = await Call.findOne({ _id: callSid });
    if (!call) return null;

    let mappedStatus: CallStatus = status.toLowerCase() as CallStatus;

    Object.assign(call, {
      status: mappedStatus,
      ...(duration !== undefined && { duration }),
      ...(recordingUrl && { recordingUrl }),
    });

    await call.save();

    io?.emit("call-status-update", {
      callSid,
      callId: call._id,
      status: mappedStatus,
      to: call.to,
      from: call.from,
      duration,
      recordingUrl,
    });

    return call;
  }


  static mapFeedbackToLeadStatus(feedbackReason: string): "called" | "disqualified" {
    const mapping: Record<string, "called" | "disqualified"> = {
      tentative_interest: "called",
      no_pickup: "called",
      not_interested: "disqualified",
      not_qualified: "disqualified",
      bad_data: "disqualified",
    };
    return mapping[feedbackReason] || "called";
  }

  static async saveFeedback(
    callId: string,
    feedbackData: {
      feedbackReason: string;
      notes?: string | null;
    }
  ) {
    const call = await Call.findById(callId);
    if (!call) throw new Error("Call not found");

    if (call.leadId && feedbackData.feedbackReason) {
      const newStatus = this.mapFeedbackToLeadStatus(feedbackData.feedbackReason);
      await Lead.findByIdAndUpdate(call.leadId, { status: newStatus });
    }

    const savedFeedback = await Feedback.create({ ...feedbackData, callId });

    io?.emit("call-feedback-received", {
      callId,
      sessionId: call.sessionId,
      feedback: savedFeedback,
    });

    return savedFeedback;
  }

  static async updateCallWithNotes(callId: string, notes: string) {
    return Call.findByIdAndUpdate(callId, { notes }, { new: true });
  }

  static async getAllCalls() {
    return Call.find().sort({ createdAt: -1 }).populate("feedback");
  }

  static async getCallById(id: string) {
    return Call.findById(id).populate("feedback");
  }

  static async getCallSessionById(id: string) {
    return CallSession.findById(id);
  }

  static async getAllCallSessions() {
    return CallSession.find().sort({ createdAt: -1 });
  }

  static async updateCallStatus(
    id: string,
    status: string,
    duration?: number,
    recordingUrl?: string
  ) {
    return Call.findByIdAndUpdate(
      id,
      {
        status,
        ...(duration && { duration }),
        ...(recordingUrl && { recordingUrl }),
      },
      { new: true }
    );
  }

  static async endCall(callSid: string) {
    await twilioClient.calls(callSid).update({ status: "completed" } as any);
    return Call.findByIdAndUpdate(callSid, { status: CallStatus.COMPLETED });
  }

  static async generateToken() {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID || "",
      process.env.TWILIO_API_KEY!,
      process.env.TWILIO_API_SECRET!,
      { identity: "user-" + Math.random().toString(36).substring(7) }
    );

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);
    accessToken.identity = "user-" + Math.random().toString(36).substring(7);

    return accessToken.toJwt();
  }
}
