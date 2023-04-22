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
  const commentsOfPost = await Comments.find({ userId, postId }).sort({
    createdAt: -1,
  });
  console.log(commentsOfPost);
  try {
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

router.put("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const { _postId } = req.params;
  const { _commentId } = req.params;
  console.log(_commentId);
  const { password, content } = req.body;

  try {
    const comments = await Comments.findOne({ _id: _commentId });

    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요" });
    }
    if (!comments) {
      return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
    }

    if (comments.password !== password) {
      return res.status(401).json({ message: "비밀번호가 다릅니다." });
    }

    await Comments.updateOne(
      { _id: _commentId },
      { $set: { content: content } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
});

// 댓글 삭제 API

router.delete("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const { _postId } = req.params;
  const { _commentId } = req.params;
  const { password } = req.body;
  try {
    const comments = await Comments.findOne({ _id: _commentId });
    if (comments.password !== password) {
      return res.status(400).json({ message: "비밀번호가 다릅니다." });
    }
    if (!comments) {
      return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
    } else {
      await Comments.deleteOne({ _id: _commentId });
      res.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다" });
  }
});
module.exports = router;
