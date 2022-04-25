const mongoose = require('mongoose');
const Tours = require('./TourModel');

const ReviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review must have a review detail"]
    },
    rating: {
        type: Number,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"],
        required: [true, "Review must have a rating"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tours",
        required: [true, "Review must have a tour"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    }
});

ReviewSchema.statics.calcAverageRating = async function (tourId) {
    //Here we create  this method with statics so method will available directly to model
    //but before we created instance method that you can only used when you create the instance that model
    const result = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: "$tour",
                noReviews: { $sum: 1 },
                avgReviews: { $avg: "$rating" },
            }
        }
    ]);

    await Tours.findByIdAndUpdate(
        tourId,
        {
            ratingsQuantity: result[0].noReviews,
            ratingsAverage: result[0].avgReviews
        })
}

ReviewSchema.post("save", async function (res, next) {
    //Now here we want to calcAverage rating based on current tour
    //so we will call "calcAverageRating" on model
    //but her one issue is we can't access model before declare 
    //now we can set this code after decalaration(#1) but then 
    // this post middleware not set to schema but we have solution for ot

    //this is current document/row which we already saved in review collection

    // Reviews.calcAverageRating(this.)

    //if you call this.constructor 
    //means as you know this is instance of model and if you use constructor then it will going for 
    //the object from this instance created so here it's "Review model"
    await this.constructor.calcAverageRating(this.tour);

});

ReviewSchema.post("deleteOne",
    { document: true, query: false },
    async function (res, next) {
        debugger;
        await this.constructor.calcAverageRating(this.tour);
        next();
    });


ReviewSchema.pre("updateOne",
    { document: true, query: false },
    async function (res, next) {
        debugger;
        await this.constructor.calcAverageRating(this.tour);
        next();
    });


ReviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "tour",
    }).populate({
        path: "user",
    })
    next()
});


const Reviews = mongoose.model("Reviews", ReviewSchema); //#1

module.exports = Reviews;