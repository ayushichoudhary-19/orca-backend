import { Request, Response } from "express";
import { Meeting } from "../models/Meeting";

export const handleCalendlyWebhook = async (req: Request, res: Response) => {
  console.log("Webhook received:", req.body);

  const event = req.body;

  try {
    if (event.event === "invitee.created") {
      const payload = event.payload;
      const { email, name } = payload;

      const scheduledEvent = payload.scheduled_event;
      const start_time = scheduledEvent.start_time;
      const uuid = scheduledEvent.uri;

      const campaignId = payload.tracking?.utm_campaign;
      const salesRepId = payload.tracking?.utm_rep_id;

      await Meeting.create({
        calendlyEventId: uuid,
        email,
        fullName: name,
        time: new Date(start_time),
        campaignId,
        salesRepId,
        status: "scheduled",
      });
    }

    if (event.event === "invitee.canceled") {
      const payload = event.payload;
      const scheduledEvent = payload.scheduled_event;
      const uuid = scheduledEvent.uri;

      await Meeting.findOneAndUpdate(
        { calendlyEventId: uuid },
        { status: "canceled" }
      );
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook handling error:", error);
    res.status(500).json({ error: "Webhook handling failed." });
  }
};
