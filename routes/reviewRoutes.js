const express = require('express');
const { getAllReview, createReview, updateReview, deleteReview, SetDataToReviewBeforeRequest, findReview } = require('../controllers/reviewController');
const { AuthorizedProtect, AuthProtect } = require('../controllers/authController');
const router = express.Router({
    mergeParams: true
});

router
    .use(AuthProtect);

router
    .route("/")
    .get(
        AuthorizedProtect('admin'),
        getAllReview)
    .post(
        AuthorizedProtect('user'),
        SetDataToReviewBeforeRequest,
        createReview);

router
    .use(
        AuthProtect,
        AuthorizedProtect('user', 'admin')
    );

router
    .route("/:id")
    .get(findReview)
    .patch(updateReview)
    .delete(deleteReview);

module.exports = router;