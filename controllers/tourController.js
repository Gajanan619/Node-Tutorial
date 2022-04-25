const fs = require('fs');
const mongoose = require('mongoose');
const TourModel = require('../Model/TourModel');
const CommonFeature = require('./utililty');
const AppError = require('../Model/AppError');
const { DeleteDocumentById, FindDocumentById, CreateDocument, UpdateDocumentById } = require('../util/Factory');

exports.checkID = async (req, res, next, val) => {
  try {
    const tour = await TourModel.findById(val);
    if (tour) {
      next();
    }
    else {
      next(new AppError("Tour Not Found", 400));
    }
  } catch (error) {
    next(error);
  }
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

exports.getAllTours = async (req, res, next) => {
  try {
    let queryStringData = { ...req.query };

    const excludeFilter = ["sort", 'limit', 'page', 'fields'];
    excludeFilter.forEach(item => {
      delete queryStringData[item];
    });

    let query = TourModel.find();

    //1.sorting
    //2.Projection
    //3.Paging

    const feature = new CommonFeature(query, req.query).sort().projection().pagination();
    const result = await feature.query;
    res.status(200).json({
      status: 'success',
      results: result.length,
      data: {
        result
      }
    });

    res.status(200).render("base")

  } catch (error) {
    next(error)
  }
};

// exports.getTour = async (req, res, next) => {
//   try {
//     const result = await TourModel.findById(req.params.id).populate("reviews", "review rating -user -tour");
//     res.status(200).json({
//       status: 'success',
//       data: {
//         result
//       }
//     });
//   } catch (error) {
//     next(error)
//   }
// };

// exports.createTour = async (req, res, next) => {
//   try {
//     const result = await TourModel.create(req.body);
//     res.status(200).json({
//       status: 'success',
//       data: {
//         result
//       }
//     });
//   } catch (error) {
//     next(error)
//   }
// };



// exports.updateTour = async (req, res, next) => {
//   try {
//     const result = await TourModel.updateOne(
//       { _id: req.params.id },
//       { $set: req.body }, {
//       runValidators: false
//     });

//     res.status(200).json({
//       status: 'success',
//       data: {
//         result
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// exports.deleteTour = async (req, res, next) => {
//   try {
//     const result = await TourModel.deleteOne({ _id: req.params.id })
//     res.status(200).json({
//       status: 'success',
//       data: {
//         result
//       }
//     });
//   } catch (error) {
//     next(error)
//   }
// };

exports.getTour = FindDocumentById(TourModel, { path: "reviews", select: "review rating -user -tour" });
exports.createTour = CreateDocument(TourModel)
exports.updateTour = UpdateDocumentById(TourModel, { runValidators: false });
exports.deleteTour = DeleteDocumentById(TourModel);

exports.tourStats = async (req, res, next) => {
  try {
    const result = await TourModel.aggregate([
      {
        $group: {
          _id: "$difficulty",
          "numTours": { $sum: 1 },
          "numRatings": { $sum: "$ratingsAverage" },
          "avgRatings": { $avg: "$ratingsAverage" },
          "avgPrice": { $avg: "$price" },
          "minPrice": { $min: "$price" },
          "maxPrice": { $max: "$price" },
        },
      },
      {
        $addFields: {
          "RoundedavgPrice": { $round: ["$avgPrice", 2] }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: result,
    })
  } catch (error) {
    next(error);
  }
}