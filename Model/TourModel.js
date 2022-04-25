const mongoose = require('mongoose');
const Users = require('./UserModel');
const slugify = require('slugify');

const TourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "tour must have a name"],
        unique: true,
        maxlength: [40, "A tour name must have less or equal then 40 characters"],
        minlength: [10, "A tour name must have more or equal then 10 characters"],
    },
    rating: {
        type: String,
        default: 4.5
    },
    duration: {
        type: Number,
        required: [true, "tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ["easy", "medium", "difficult"],
            message: "value must be easy, medium, difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "Rating must be above 1.0"],
        max: [5, "Rating must be below 5.0"]
    },
    ratingsQuantity: {
        type: Number,
    },
    price: {
        type: Number,
        required: [true, "tour price is required"],
    },
    discountPrice: {
        type: Number,
        validate: {
            validator: function (val) {
                return this.price < val;
            },
            message: "Discount price must be lower than actual price"
        },
    },
    summary: {
        type: String,
        required: [true, "tour summary is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, "tour description is required"],
    },
    imageCover: {
        type: String,
        required: [true, "tour imageCover is required"],
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],

    guides: [{
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    }],
    slug: String,

},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

TourSchema.pre(/^find/, function (next) {
    this.populate("guides");
    next();
});

TourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});


//157
TourSchema.virtual("reviews", {
    ref: "Reviews",
    foreignField: "tour",
    localField: "_id",
});



TourSchema.pre("save", function (next) {
    //here "this" means current document
    console.log(this);
    next();
});

TourSchema.post("save", function (res, next) {
    console.log(res);
    next()
});


TourSchema.pre('find', function (next) {
    this.find({ isvoid: 0 });
    this.startTime = new Date();
    next();
});


TourSchema.pre("aggregate", function (next) {
    console.log(this.pipeline());
    this.pipeline().unshift({ $match: { price: { $gt: 400 } } });
    next();
})

TourSchema.post('find', function (res, next) {
    console.log(`Time taken by query: ${Date.now() - this.startTime} ms`);
    next();
})

const Tours = mongoose.model("Tours", TourSchema);

module.exports = Tours