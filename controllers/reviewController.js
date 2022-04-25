const Reviews = require("../Model/ReviewModel");
const { CreateDocument, UpdateDocumentById, DeleteDocumentById, FindDocumentById } = require("../util/Factory");


exports.getAllReview = async (req, res, next) => {
    try {
        let filter;
        if (req.params.tourId) {
            filter = { tour: req.params.tourId }
        }

        const response = await Reviews.find(filter);

        res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {
        next(error);
    }
}

// exports.createReview = async (req, res, next) => {
//     try {
//         if (!req.body.tour) {
//             req.body.tour = req.params.tourId
//         }
//         if (!req.body.user) {
//             req.body.user = req.user.id
//         }

//         const response = await Reviews.create(req.body);
//         res.status(200).json({
//             success: true,
//             data: response
//         });
//     } catch (error) {
//         next(error);
//     }
// }

exports.SetDataToReviewBeforeRequest = (req, res, next) => {
    if (!req.body.tour) {
        req.body.tour = req.params.tourId
    }
    if (!req.body.user) {
        req.body.user = req.user.id
    }
    next();
}

exports.createReview = CreateDocument(Reviews);
exports.findReview = FindDocumentById(Reviews);
exports.updateReview = UpdateDocumentById(Reviews);
exports.deleteReview = DeleteDocumentById(Reviews);
