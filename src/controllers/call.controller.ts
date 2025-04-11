import { Request, Response } from "express";
import { CallService, CallStatus } from "../services/call.service";

export class CallController {
  static async startCallSession(req: Request, res: Response) {
    const { phoneNumbers, from, script } = req.body;

    if (
      !phoneNumbers ||
      !Array.isArray(phoneNumbers) ||
      phoneNumbers.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Valid phone numbers array is required" });
    }

    try {
      const result = await CallService.startCallSession(
        phoneNumbers,
        from,
        script
      );
      return res.status(201).json(result);
    } catch (error) {
      console.error("Error in startCallSession controller:", error);
      return res.status(500).json({ error: "Failed to start call session" });
    }
  }

  static async createCall(req: Request, res: Response) {
    const { id, to, from } = req.body;
    if (!id || !to) {
      return res
        .status(400)
        .json({ error: "Call ID and 'to' number are required" });
    }

    try {
      const call = await CallService.createCallRecord({
        id,
        to,
        from: from || process.env.TWILIO_PHONE_NUMBER || "",
        status: CallStatus.INITIATED,
      });
      return res.status(201).json(call);
    } catch (error) {
      console.error("Error in createCall controller:", error);
      return res.status(500).json({ error: "Failed to create call" });
    }
  }

  static async proceedToNextCall(req: Request, res: Response) {
    const { sessionId, currentCallId, feedback, from, script } = req.body;

    if (!sessionId || !currentCallId || !feedback || !feedback.callOutcome) {
      return res
        .status(400)
        .json({
          error: "Session ID, current call ID, and valid feedback are required",
        });
    }

    try {
      const nextCall = await CallService.proceedToNextCall(
        sessionId,
        currentCallId,
        feedback,
        from,
        script
      );
      return res
        .status(200)
        .json({ success: true, isComplete: nextCall === null, nextCall });
    } catch (error) {
      console.error("Error in proceedToNextCall controller:", error);
      return res.status(500).json({ error: "Failed to proceed to next call" });
    }
  }

  static async submitFeedback(req: Request, res: Response) {
    const { callId, callOutcome, leadStatus, notes } = req.body;

    if (!callId || !callOutcome) {
      return res
        .status(400)
        .json({ error: "Call ID and call outcome are required" });
    }

    try {
      const feedbackData = await CallService.saveFeedback(callId, {
        callOutcome,
        leadStatus,
        notes: notes || null,
      });
      return res.status(201).json(feedbackData);
    } catch (error) {
      console.error("Error in submitFeedback controller:", error);
      return res.status(500).json({ error: "Failed to submit feedback" });
    }
  }

  static async getAllCalls(req: Request, res: Response) {
    try {
      const calls = await CallService.getAllCalls();
      return res.status(200).json(calls);
    } catch (error) {
      console.error("Error in getAllCalls controller:", error);
      return res.status(500).json({ error: "Failed to retrieve calls" });
    }
  }

  static async getAllCallSessions(req: Request, res: Response) {
    try {
      const sessions = await CallService.getAllCallSessions();
      return res.status(200).json(sessions);
    } catch (error) {
      console.error("Error in getAllCallSessions controller:", error);
      return res
        .status(500)
        .json({ error: "Failed to retrieve call sessions" });
    }
  }

  static async getCallById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const call = await CallService.getCallById(id);
      if (!call) return res.status(404).json({ error: "Call not found" });
      return res.status(200).json(call);
    } catch (error) {
      console.error("Error in getCallById controller:", error);
      return res.status(500).json({ error: "Failed to retrieve call" });
    }
  }

  static async getCallSessionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const session = await CallService.getCallSessionById(id);
      if (!session)
        return res.status(404).json({ error: "Call session not found" });
      return res.status(200).json(session);
    } catch (error) {
      console.error("Error in getCallSessionById controller:", error);
      return res.status(500).json({ error: "Failed to retrieve call session" });
    }
  }

  static async handleStatusCallback(req: Request, res: Response) {
    try {
      const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;

      if (!CallSid || !CallStatus) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      await CallService.handleCallStatusUpdate(
        CallSid,
        CallStatus,
        CallDuration ? parseInt(CallDuration, 10) : undefined,
        RecordingUrl
      );

      res.setHeader("Content-Type", "text/xml");
      return res.send("<Response></Response>");
    } catch (error) {
      console.error("Error in handleStatusCallback controller:", error);
      return res.status(500).json({ error: "Failed to update call status" });
    }
  }

  static async handleCallConnection(req: Request, res: Response) {
    try {
      const { CallSid, To } = req.body;
      if (!CallSid || !To)
        return res.status(400).send("Missing CallSid or To number");

      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!twilioPhoneNumber)
        throw new Error("TWILIO_PHONE_NUMBER not configured");

      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Connecting your call</Say><Dial answerOnBridge="true" callerId="${twilioPhoneNumber}"><Number>${To}</Number></Dial></Response>`;
      res.type("text/xml");
      return res.send(twiml);
    } catch (error) {
      console.error("Error in handleCallConnection:", error);
      res.type("text/xml");
      return res.send(
        `<Response><Say>We apologize, but we couldn't connect your call. Please try again.</Say><Hangup/></Response>`
      );
    }
  }

  static async updateCallNotes(req: Request, res: Response) {
    const { callId, notes } = req.body;
    if (!callId) return res.status(400).json({ error: "Call ID is required" });

    try {
      const updatedCall = await CallService.updateCallWithNotes(callId, notes);
      return res.status(200).json(updatedCall);
    } catch (error) {
      console.error("Error in updateCallNotes controller:", error);
      return res.status(500).json({ error: "Failed to update notes" });
    }
  }

  static async endCall(req: Request, res: Response) {
    const { callId } = req.body;
    if (!callId) return res.status(400).json({ error: "Call ID is required" });

    try {
      const result = await CallService.endCall(callId);
      return res.status(200).json({ success: result });
    } catch (error) {
      console.error("Error in endCall controller:", error);
      return res.status(500).json({ error: "Failed to end call" });
    }
  }

  static async generateToken(req: Request, res: Response) {
    try {
      const token = await CallService.generateToken();
      return res.status(200).json({ token });
    } catch (error) {
      console.error("Error in generateToken controller:", error);
      return res.status(500).json({ error: "Failed to generate token" });
    }
  }
}
