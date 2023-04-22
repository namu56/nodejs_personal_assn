const express = require("express");
const router = express.Router();

const Comments = require("../schemas/comments.js");
const Posts = require("../schemas/posts.js");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 댓글 생성

router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  const { comment } = req.body;

  try {
    const post = await Posts.findById(postId);
    if (!post) {
      res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
      return;
    }
    if (!comment) {
      res.status(400).json({ message: "댓글 내용을 입력해주세요." });
      return;
    }
    await Comments.create({
      userId: userId,
      comment,
      postId: postId,
    });
    res.status(200).json({ message: "댓글을 생성하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "댓글 작성에 실패하였습니다." });
  }
});

// 댓글 목록 조회 API

router.get("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { postId } = req.params;

  try {
    const commentsOfPost = await Comments.find({ userId, postId }).sort({
      createdAt: -1,
    });
    const comments = commentsOfPost.map((item) => {
      return {
        commentId: item._id,
        userId: item.userId,
        nickname,
        comment: item.comment,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "댓글 조회에 실패하였습니다." });
  }
});

// 댓글 수정 API

router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;
    const { comment } = req.body;

    try {
      const post = await Posts.findOne({ _id: postId });
      if (!post) {
        res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        return;
      }
      if (userId !== post.userId.toString()) {
        res
          .status(403)
          .json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
        return;
      }
      const commentOfPost = await Comments.findOne({ _id: commentId });
      if (!commentOfPost) {
        res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
        return;
      }
      if (!comment) {
        res.status(412).json({ errorMessage: "댓글 내용을 입력해주세요" });
        return;
      }
      await Comments.updateOne(
        { _id: commentId },
        { $set: { comment: comment } }
      );
      return res.json({ message: "댓글을 수정하였습니다." });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "댓글 수정에 실패하였습니다." });
      return;
    }
  }
);

// 댓글 삭제 API

router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { userId } = res.locals.user;
    const { postId, commentId } = req.params;

    try {
      const post = await Posts.findOne({ _id: postId });
      if (!post) {
        res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        return;
      }
      if (userId !== post.userId.toString()) {
        res
          .status(403)
          .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
        return;
      }
      const commentOfPost = await Comments.findOne({ _id: commentId });
      if (!commentOfPost) {
        res.status(404).json({ message: "댓글이 존재하지 않습니다." });
        return;
      }
      await Comments.deleteOne({ _id: commentId });
      return res.json({ message: "댓글을 삭제하였습니다." });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "댓글 삭제에 실패하였습니다." });
      return;
    }
  }
);
module.exports = router;
