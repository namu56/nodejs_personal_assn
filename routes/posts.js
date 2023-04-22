const express = require("express");
const router = express.Router();

const Posts = require("../schemas/posts");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 게시글 작성 API

router.post("/posts", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { title, content } = req.body;

  // 데이터가 정상적으로 전달되지 않는 경우
  if (!title || !content) {
    res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
    return;
  }
  // title의 형식이 비정상적인 겨우
  if (typeof title !== "string") {
    res
      .status(412)
      .json({ errorMessage: "게시글 제목의 형식이 일치하지 않습니다." });
    return;
  }
  // content의 형식이 비정상적인 경우
  if (typeof content !== "string") {
    res
      .status(412)
      .json({ errorMessage: "게시글 내용의 형식이 일치하지 않습니다." });
    return;
  }
  try {
    await Posts.create({ title, content, userId });
    return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." });
    return;
  }
});

// 전체 게시글 목록 조회

router.get("/posts", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;

  const postsOfUser = await Posts.find({ userId: userId }).sort({
    createdAt: -1,
  });
  try {
    const posts = postsOfUser.map((item) => {
      return {
        postId: item.postId,
        userId: item.userId,
        nickname: nickname,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });
    return res.status(200).json({ posts });
  } catch (error) {
    console.error(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    return;
  }
});

// 게시글 상세 조회
// 제목, 작성자명, 작성 날짜, 작성 내용 조회

router.get("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  console.log(typeof _postId);
  try {
    const posts = await Posts.find({});
    const [result] = posts.filter((post) => String(post._id) === _postId);
    return res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: "false" });
  }
});

//게시글 수정 API

router.put("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const { password, title, content } = req.body;

  try {
    if (!password || !title || !content) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

    const posts = await Posts.find({ _id: _postId });

    if (!posts) {
      return res.status
        .apply(404)
        .json({ message: "게시글 조회에 실패했습니다." });
    }
    if (posts.password !== password) {
      console.log(posts.password !== password);
      return res.status(401).json({ message: "비밀번호가 다릅니다." });
    }
    await Posts.updateOne(
      { _id: _postId },
      { $set: { title: title, content: content } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 게시글 삭제 API

router.delete("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const { password } = req.body;

  try {
    const posts = await Posts.findOne({ _id: _postId });

    if (!posts) {
      return res.status
        .apply(404)
        .json({ message: "게시글 조회에 실패했습니다." });
    }
    if (posts.password !== password) {
      return res.status(401).json({ message: "비밀번호가 다릅니다." });
    }
    await Posts.deleteOne({ _id: _postId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
