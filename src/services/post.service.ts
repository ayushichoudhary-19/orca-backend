import PostModel, { PostInput } from "../models/Post";

class PostService {
  async createPost(data: PostInput) {
    const newPost = new PostModel(data);
    return await newPost.save();
  }

  async getPostsByCampaignId(campaignId: string) {
    return await PostModel.find({ campaignId }).sort({ createdAt: -1 });
  }

  async deletePost(id: string) {
    const deletedPost = await PostModel.findByIdAndDelete(id);
    if (!deletedPost) {
      throw new Error("Post not found");
    }
    return deletedPost;
  }
}

export default new PostService();
