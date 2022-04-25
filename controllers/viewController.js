const Tours = require("../Model/TourModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const Users = require("../Model/UserModel");
const AppError = require("../Model/AppError");

exports.getAllViewTours = async (req, res, next) => {
    try {
        const tours = await Tours.find();
        res.status(200).render("overview", {
            tours: tours
        });
    } catch (error) {
        next(error);
    }
}


//this middleware alwyas run before any page load
//to check user is login or not and we do not throw any error
exports.isLogin = async (req, res, next) => {
    try {
        let token;
        res.set(
            'Content-Security-Policy',
            "script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/axios/0.26.1/axios.min.js 'unsafe-inline' 'unsafe-eval';"
        )
        if (req.cookies?.jwt) {
            token = req.cookies.jwt;

            console.log("token:", token);
            if (!token) {
                return next();
            }

            const decodedData = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

            const user = await Users.findOne({ _id: decodedData.id });
            if (!user) {
                return next();
            }

            if (!user.passwordChangedAfter(decodedData.iat)) {
                return next();
            }

            res.locals.user = user

            return next();
        }

        next();

    } catch (error) {
        // next(error);
        next();
    }
}

exports.logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "logout", {
            httpOnly: true,
        });
        res.status(200).json({ status: "success" });
    } catch (error) {
        next(error)
    }
}

exports.userAccount = (req, res, next) => {
    try {
        
        if (!res.locals.user) {
            return next(new AppError("You are not logged in! Please Login into get access.", 401));
        }
        return res
            .status(200)
            .render('account', {
                title: 'account',
            });
    } catch (error) {
        next(error)
    }
}

exports.login = (req, res, next) => {
    try {
        res
            .status(200)
            .render('login', {
                title: 'Login',
            });
    } catch (error) {
        next(error)
    }
};

exports.getViewTour = async (req, res, next) => {
    try {
        const tour = await Tours.findOne({ "slug": req.params.tourName }).populate({
            path: "reviews",
            select: "review rating user"
        });

        if (!tour) {
            return next(new AppError("Tour not found!!", 404));
        }

        res.status(200).render("tour", {
            tour: tour
        });

    } catch (error) {
        next(error);
    }
}

//195
exports.updateUserData = async (req, res, next) => {
    try {
        //195 so here we pass form data directly to this handler
        //we are not calling api
        //but there is once issue is we can not access form data directly
        //for this we need diffrent parser in app.js

        //Now with form there is one problem is it's very hard to error handling on frontend
        //because we are not calling api from code so we error comes it will display error page
        console.log(req.body);

        const updatedUser = await Users.findByIdAndUpdate(req.user.id, {
            name: req.body.name,
            email: req.body.email
        }, { new: true, runValidators: true });

        res.status(200).render("account", {
            status: "success",
            user: updatedUser
        })

    } catch (error) {
        next(error);
    }
}

