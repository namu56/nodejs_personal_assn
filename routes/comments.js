const express = require("express");
const router = express.Router();

const Comments = require("../schemas/comments.js");
const Posts = require("../schemas/posts.js");

// 댓글 생성

router.post("/posts/:_postId/comments", async (req, res) => {
  const { user, password, content } = req.body;
  const { _postId } = req.params;
  console.log(_postId);

  try {
    if (!user || !password) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }
    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }
    await Comments.create({
      user,
      password,
      content,
      postId: _postId,
    });
    res.status(200).json({ message: "댓글을 생성하였습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 댓글 목록 조회 API

router.get("/posts/:_postId/comments", async (req, res) => {
  try {
    const { _postId } = req.params;
    const comments = await Comments.find({})
      .select("user content createdAt")
      .sort({ createdAt: -1 });

    let newComments = [];
    comments.forEach((comment) => {
      let obj = {
        _commentId: comment._id.toString(),
        user: comment.user,
        content: comment.content,
        createdAt: comment.createdAt,
      };
      newComments.push(obj);
    });
    res.status(200).json({ newComments });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

// 댓글 수정 API

router.put("/posts/:_postId/comments/:_commentId", async (req, res) => {
  const { _postId } = req.params;
  const { _commentId } = req.params;
  console.log(_commentId);
  const { password, content } = req.body;

  try {
    if (!password) {
      return res
        .status(400)
        .json({ message: "비밀번호가 입력되지 않거나 다릅니다." });
    }

    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요" });
    }
    const comments = await Comments.findOne({ _id: _commentId });

    if (!comments) {
      return res.status(404).json({ message: "댓글 조회에 실패하였습니다." });
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

module.exports = router;
