const express = require("express");
const router = express.Router();

const Posts = require("../schemas/posts");

// 게시글 작성

router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (!user || !password || !title || !content) {
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  }
  await Posts.create({
    user,
    password,
    title,
    content,
  });
  res.status(201).json({ message: "게시글을 생성하였습니다." });
});

// 전체 게시글 목록 조회

router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.find({}).select("user title createdAt ").sort({
      createdAt: -1,
    });
    let newPosts = [];
    posts.forEach((post) => {
      let obj = {
        _postId: post._id.toString(),
        user: post.user,
        title: post.title,
        createdAt: post.createdAt,
      };
      newPosts.push(obj);
    });
    res.status(200).json({ newPosts });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

// 게시글 상세 조회
// 제목, 작성자명, 작성 날짜, 작성 내용 조회

router.get("/posts/:_postId", async (req, res) => {
  const { _postId } = req.params;
  console.log(_postId);
  // 전체 조회 필요 있나? 한개만 조회하는 경우
  const posts = await Posts.find({});
  let newPosts = [];
  posts.forEach((post) => {
    let obj = {
      _postId: post._id,
      user: post.user,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
    };
    newPosts.push(obj);
  });
  try {
    const [detail] = newPosts.filter(
      (post) => String(post._postId) === String(_postId)
    );
    res.json({ detail });
  } catch (err) {
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
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

    const posts = await Posts.findOne({ _id: _postId });
    console.log(posts);

    if (!posts) {
      return res.status
        .apply(404)
        .json({ message: "게시글 조회에 실패했습니다." });
    }
    if (posts.password !== password) {
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
  const { password, title, content } = req.body;

  try {
    if (!password || !title || !content) {
      return res
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다." });
    }

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

// 댓글 목록 조회 API

module.exports = router;
