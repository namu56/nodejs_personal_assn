const express = require("express");
const app = express();
const port = 3000;

const postsRouter = require("./routes/posts.route.js");
// const commentsRouter = require("./routes/comments.js");
const usersRouter = require("./routes/users.route.js");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use("/", [postsRouter, usersRouter]);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
