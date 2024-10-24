const express = require("express");
const router = express.Router();

const users = require("../data/users");
const error = require("../utilities/error");
const comments = require("../data/comments");
router
  .route("/")
  .get((req, res) => {
    const links = [
      {
        href: "users/:id",
        rel: ":id",
        type: "GET",
      },
    ];

    res.json({ users, links });
  })
  .post((req, res, next) => {
    if (req.body.name && req.body.username && req.body.email) {
      if (users.find((u) => u.username == req.body.username)) {
        next(error(409, "Username Already Taken"));
      }

      const user = {
        id: users[users.length - 1].id + 1,
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
      };

      users.push(user);
      res.json(users[users.length - 1]);
    } else next(error(400, "Insufficient Data"));
  });

router
  .route("/:id")
  .get((req, res, next) => {
    const user = users.find((u) => u.id == req.params.id);

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

    if (user) res.json({ user, links });
    else next();
  })
  .patch((req, res, next) => {
    const user = users.find((u, i) => {
      if (u.id == req.params.id) {
        for (const key in req.body) {
          users[i][key] = req.body[key];
        }
        return true;
      }
    });

    if (user) res.json(user);
    else next();
  })
  .delete((req, res, next) => {
    const user = users.find((u, i) => {
      if (u.id == req.params.id) {
        users.splice(i, 1);
        return true;
      }
    });

    if (user) res.json(user);
    else next();
  });

// GET /users/:id/comments
// Retrieves comments made by the user with the specified id.

router.get("/:userId/comments", (req, res, next) => {
  const { userId } = req.params;  // Capture the post id from the URL
  const { postId } = req.query;
  let postComments = {};
  // Filter comments by postId
  if (postId) {
    postComments = comments.filter(comment => comment.userId == userId && comment.postId == postId);
    if (postComments.length > 0) {
      res.json({ "specific userId and postId comments:": postComments });
    } else {
      next(error(404, `No comments found for user ID ${userId} and post ID ${postId}`));
    }

  } else {
    postComments = comments.filter(comment => comment.userId == userId);

    if (postComments.length > 0) {
      res.json({ "userId comments": postComments });
    } else {
      next(error(404, `No comments found for post ID ${id}`));  // Return 404 if no comments found
    }
  }


});



module.exports = router;
