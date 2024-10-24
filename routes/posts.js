const express = require("express");
const router = express.Router();

const posts = require("../data/posts");
const error = require("../utilities/error");
const comments = require("../data/comments");
router
  .route("/")
  .get((req, res) => {


    //part 2 get posts by userId
    const { userId } = req.query;
    console.log("userId", userId);
    let filteredPosts = posts;

    if (userId) {
      filteredPosts = posts.filter((p) => p.userId == userId);

      if (filteredPosts.length === 0) {
        res.error(404, "No Posts Found");
        return;
      }

    }


    const links = [
      {
        href: "posts/:id",
        rel: ":id",
        type: "GET",
      },
    ];

    res.json({ filteredPosts, links });
  })
  .post((req, res, next) => {
    if (req.body.userId && req.body.title && req.body.content) {
      const post = {
        id: posts[posts.length - 1].id + 1,
        userId: req.body.userId,
        title: req.body.title,
        content: req.body.content,
      };

      posts.push(post);
      res.json(posts[posts.length - 1]);
    } else next(error(400, "Insufficient Data"));
  });

router
  .route("/:id")
  .get((req, res, next) => {
    const post = posts.find((p) => p.id == req.params.id);

    const links = [
      {
        href: `/${req.params.id}`,
        rel: "",
        type: "PATCH",
      },
      {
        href: `/${req.params.id}`,
        rel: "",
        type: "DELETE",
      },
    ];

    if (post) res.json({ post, links });
    else next();
  })
  .patch((req, res, next) => {
    const post = posts.find((p, i) => {
      if (p.id == req.params.id) {
        for (const key in req.body) {
          posts[i][key] = req.body[key];
        }
        return true;
      }
    });

    if (post) res.json(post);
    else next();
  })
  .delete((req, res, next) => {
    const post = posts.find((p, i) => {
      if (p.id == req.params.id) {
        posts.splice(i, 1);
        return true;
      }
    });

    if (post) res.json(post);
    else next();
  });

//   GET /posts/:id/comments?userId=<VALUE>
// Retrieves all comments made on the post with the specified id by a user with the specified userId

router.get("/:postId/comments", (req, res, next) => {
  const { postId } = req.params;  // Capture the post id from the URL
  const { userId } = req.query;  // Capture the user id from the query string
  let postComments = {};

  if (userId) {
    postComments = comments.filter((c) => c.postId == postId && c.userId == userId);  // Filter comments by post ID and user ID
    if (postComments.length === 0) {
      next(error(404, `No comments found for post ID ${id} and user ID ${userId}`));  // Return 404 if no comments found
      return;
    }
  } else {
    postComments = comments.filter((c) => c.postId == postId);  // Filter comments by post ID
    if (postComments.length === 0) {
      next(error(404, `No comments found for post ID ${id}`));  // Return 404 if no comments found
      return;
    }

  }

  res.json(postComments);



});


module.exports = router;
