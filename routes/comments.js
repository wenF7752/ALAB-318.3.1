const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

let comments = require("../data/comments");  // Load in-memory comments
const error = require("../utilities/error");

// Path to the comments.js file
const commentsFilePath = path.join(__dirname, "../data/comments.js");

router.route("/")
    .get((req, res, next) => {
        const { userId, postId } = req.query;

        let filteredComments = comments;

        // Apply filters if userId or postId is provided
        if (userId) {
            filteredComments = filteredComments.filter(comment => comment.userId == userId);
        }

        if (postId) {
            filteredComments = filteredComments.filter(comment => comment.postId == postId);
        }

        // Respond with either the filtered comments or all comments
        res.json({ comments: filteredComments });
    })
    .post((req, res, next) => {
        const { userId, postId, body } = req.body;

        // Log the received data for debugging
        console.log("Received data:", req.body);

        if (userId && postId && body) {
            const newId = comments.length > 0 ? comments[comments.length - 1].id + 1 : 1;

            const comment = {
                id: newId,
                userId: userId,
                postId: postId,
                body: body,
                timestamp: new Date().toISOString()  // Automatically add a timestamp
            };

            // Add the new comment to the in-memory comments array
            comments.push(comment);

            // Write the updated comments array back to the comments.js file
            const commentsFileContent = `const comments = ${JSON.stringify(comments, null, 2)};\nmodule.exports = comments;`;

            fs.writeFile(commentsFilePath, commentsFileContent, (err) => {
                if (err) {
                    console.error("Failed to update comments file:", err);
                    return next(error(500, "Failed to save comment"));
                }

                console.log("Updated comments:", comments);  // Log updated comments
                res.json(comments[comments.length - 1]);  // Respond with the newly added comment
            });
        } else {
            next(error(400, "Insufficient Data"));  // Handle missing data
        }
    });

router.route("/:id")
    .get((req, res, next) => {
        const comment = comments.find((c) => c.id == req.params.id);

        if (comment) {
            res.json(comment);
        } else {
            next();
        }
    })
    .patch((req, res, next) => {
        const { id } = req.params;
        const { body } = req.body;

        const commentIndex = comments.findIndex((c) => c.id == id);

        if (commentIndex !== -1) {
            comments[commentIndex].body = body;
            comments[commentIndex].timestamp = new Date().toISOString();

            // Write the updated comments array back to the file
            const commentsFileContent = `const comments = ${JSON.stringify(comments, null, 2)};\nmodule.exports = comments;`;

            fs.writeFile(commentsFilePath, commentsFileContent, (err) => {
                if (err) {
                    console.error("Failed to update comments file:", err);
                    return next(error(500, "Failed to update comment"));
                }

                console.log("Updated comments:", comments);  // Log updated comments
                res.json(comments[commentIndex]);  // Respond with the updated comment
            });
        } else {
            next(error(404, "Comment not found"));
        }
    })
    .delete((req, res, next) => {
        const { id } = req.params;

        const commentIndex = comments.findIndex((c) => c.id == id);

        if (commentIndex !== -1) {
            const deletedComment = comments.splice(commentIndex, 1);

            // Write the updated comments array back to the file
            const commentsFileContent = `const comments = ${JSON.stringify(comments, null, 2)};\nmodule.exports = comments;`;

            fs.writeFile(commentsFilePath, commentsFileContent, (err) => {
                if (err) {
                    console.error("Failed to update comments file:", err);
                    return next(error(500, "Failed to delete comment"));
                }

                console.log("Updated comments:", comments);  // Log updated comments
                res.json(deletedComment[0]);  // Respond with the deleted comment
            });
        } else {
            next(error(404, "Comment not found"));
        }
    });


module.exports = router;