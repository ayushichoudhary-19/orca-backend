import { Request, Response } from "express";
import { Meeting } from "../models/Meeting";
import { Campaign } from "../models/Campaign";
import axios from "axios";
import { User } from "../models/User";
import { Lead } from "../models/Lead";

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

      const sdrEmail = payload.questions_and_answers?.find(
        (q: any) => q.question === "SDR's Registered Email ID"
      )?.answer;

      const salesRep = sdrEmail
        ? await User.findOne({ email: sdrEmail })
        : null;
      const salesRepId = salesRep?._id?.toString();

      await Meeting.create({
        calendlyEventId: uuid,
        email,
        fullName: name,
        time: new Date(start_time),
        campaignId,
        salesRepId,
        status: "scheduled",
      });

      await Lead.findOneAndUpdate({ email, campaignId }, { status: "meeting" });
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

const CLIENT_ID = process.env.CALENDLY_CLIENT_ID!;
const CLIENT_SECRET = process.env.CALENDLY_CLIENT_SECRET!;
const REDIRECT_URI = `${process.env.BASE_URL}/api/calendly/oauth/callback`;

export const startCalendlyOAuth = (req: Request, res: Response) => {
  const { campaignId } = req.query;

  if (!campaignId) {
    res.status(400).json({ error: "Missing campaignId in query" });
    return;
  }

  const redirectUri = `${process.env.BASE_URL}/api/calendly/oauth/callback`;
  const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${campaignId}`;

  res.redirect(authUrl);
};

export const handleCalendlyOAuthCallback = async (
  req: Request,
  res: Response
) => {
  const code = req.query.code as string;
  const campaignId = req.query.state as string;

  if (!campaignId) {
    res.status(400).send("Missing campaignId (state)");
    return;
  }

  try {
    const tokenRes = await axios.post("https://auth.calendly.com/oauth/token", {
      grant_type: "authorization_code",
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const calendlyLink = userRes.data.resource.scheduling_url;
    const userUri = userRes.data.resource.uri;
    const organizationUri = userRes.data.resource.current_organization;
    if (!organizationUri) {
      console.error(
        "Organization URI not found in /users/me response. Cannot register webhook requiring organization."
      );
    }

    await Campaign.findByIdAndUpdate(campaignId, {
      calendlyLink,
      calendlyAccessToken: accessToken,
    });

    console.log("Attempting to register webhook for user URI:", userUri);
    console.log(
      "Webhook URL to be registered:",
      `${process.env.BASE_URL}/api/calendly/webhook`
    );

    await axios.post(
      "https://api.calendly.com/webhook_subscriptions",
      {
        url: `${process.env.BASE_URL}/api/calendly/webhook`,
        events: ["invitee.created", "invitee.canceled"],
        scope: "organization",
        organization: organizationUri,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.redirect(`${process.env.CLIENT_URL}/meetings?connected=calendly`);
    return;
  } catch (error: any) {
    console.error("OAuth callback error encountered!");
    if (error.isAxiosError) {
      console.error("Axios Error Details:");
      console.error("Error Message:", error.message);
      if (error.response) {
        console.error("Response Status:", error.response.status);
        console.error(
          "Response Data:",
          JSON.stringify(error.response.data, null, 2)
        );
        console.error("Response Headers:", error.response.headers);
      }
      console.error("Request Config:", error.config);
    } else {
      console.error("Non-Axios Error:", error.message);
      console.error("Full error object:", error);
    }
    res
      .status(500)
      .send("Calendly OAuth failed. Check server logs for details.");
    return;
  }
};
