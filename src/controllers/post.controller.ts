import { Request, Response, NextFunction } from "express";
import PostService from "../services/post.service";
import { messaging } from "../utils/firebase";
import { User } from "../models/User";
import { MulticastMessage } from "firebase-admin/messaging";

export class PostController {
  static async createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { campaignId, title, content, createdBy } = req.body;

      if (!campaignId || !title || !content || !createdBy) {
        return void res.status(400).json({
          error:
            "Missing required fields: campaignId, title, content, createdBy",
        });
      }

      const newPost = await PostService.createPost({
        campaignId,
        title,
        content,
        createdBy,
      });

      const subscribers = await User.find({
        campaignsSubscribedTo: campaignId,
        fcmTokens: { $exists: true, $ne: [] },
      });

      const tokens = subscribers.flatMap((user) => user.fcmTokens ?? []);

      if (tokens.length > 0) {
        const message: MulticastMessage = {
          tokens,
          notification: {
            title: "📢 New Post in Campaign!",
            body: title,
          },
          data: {
            type: "post",
            campaignId,
            postId: String(newPost._id),
          },
        };

        await messaging.sendEachForMulticast(message);
      }

      res.status(201).json(newPost);
    } catch (error: any) {
      console.error("Error creating post:", error);
      next(error);
    }
  }

  static async getPostsByCampaignId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { campaignId } = req.params;

      if (!campaignId) {
        return void res.status(400).json({
          error: "Campaign ID is required",
        });
      }

      const posts = await PostService.getPostsByCampaignId(campaignId);
      res.status(200).json(posts);
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      next(error);
    }
  }

  static async deletePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        return void res.status(400).json({
          error: "Post ID is required",
        });
      }

      await PostService.deletePost(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting post:", error);
      next(error);
    }
  }
}
