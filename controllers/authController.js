const crypto = require("crypto");
const Users = require("../Model/UserModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../Model/AppError");
const SendMail = require("../util/SendMail");

//199 Multer File Upload
const multer = require('multer');

//200 multer Filter and Multer diskStorage

//A. Multer Storage is used to store the file in memory as a buffer,
// so that we could then use it later by other processes.
const multerStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "public/img/users");
    },
    filename: (req, file, callback) => {
        //this file is same body.file
        const extension = file.mimetype.split("/")[1];//  mimetype: 'image/jpeg' ==> jpeg
        callback(null, `user-${req.user.id}-${Date.now()}.${extension}`)
    }
});

//B. File Filter
// the goal is basically
// to test if the uploaded file is an image.
const multerFilter = (req, file, callback) => {
    if (file.mimetype.startsWith("image")) {
        callback(null, true);
    }
    else {
        callback(new AppError("Not a Image! Please upload only images.", 400), false)
    }
}


// const upload = multer({ dest: "public/img/users" });

//200 Configure Multer 
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});


const createTokenAndSendAsResponse = (res, userId, statusCode) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    debugger;
    //142. send data as cookie start
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIES_DAYS_AFTER_EXPIRE * 24 * 60 * 60 * 1000),
        //192
        // It means we can not manipulate cookies in browser anyway not even delete cookie
        // so logout user we will send back cookie with same name but without token 
        // so it will simply replace cookie in browser
        httpOnly: true,
    }
    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true
    }

    res.cookie('jwt', token, cookieOptions)
    //142. end

    res.status(statusCode).json({
        status: "success", token
    })
}

//200
//Upload file middleware
exports.uploadUserPhoto = upload.single("photo");

exports.Signup = async (req, res, next) => {
    try {
        const newUser = await Users.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
        });

        createTokenAndSendAsResponse(res, newUser._id, 201);
    } catch (error) {
        next(error)
    }
}

exports.Login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email && !password) {
            return next(new AppError("Please provide email and password!", 400));
        }

        const user = await Users.findOne({ email: email }).select('+password');
        if (!user || !await user.checkPassword(password, user.password)) {
            return next(new AppError("email or password were incorrect."), 401);
        }

        createTokenAndSendAsResponse(res, user._id, 200);

    } catch (error) {
        next(error);
    }
}

exports.AuthProtect = async (req, res, next) => {
    try {

        let token;
        //generally we send token with request but we sent as header("Authorization")
        //1.extract token from header
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        else if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return next(new AppError("You are not logged in! Please Login into get access.", 401));
        }

        //2.verify JWT token
        //(Asynchronous) If a callback is supplied, function acts asynchronously. The callback is called with 
        // the decoded payload if the signature
        //(Synchronous) If a callback is not supplied, function acts synchronously. Returns the payload decoded

        // await jwt.verify(token, process.env.JWT_SECRET, () => {
        // Callback
        // })

        //But we have "promisify" method built in node
        //which convert sync code to async code 
        const decodedData = await promisify(jwt.verify)(token, process.env.JWT_SECRET);


        // Most tutorial paused after step-2 but 
        // in mean time if user was deleted or password was changed so we have to check this conditions.
        //3.check if user still exists  
        const user = await Users.findOne({ _id: decodedData.id });
        if (!user) {
            return next(new AppError("The user belonging to this token no longer exist."));
        }

        //4.check if user has changed password after token issued
        // so for this in schema we have add new field "passwordChangeAt"
        // which we use in other lecture and when password gets change datetime will be set
        if (!user.passwordChangedAfter(decodedData.iat)) {
            return next(new AppError("User has recently changed the password! Please login again.", 400));
        }

        //after all detail confirm then we have to add userdetails into request
        //so in anywhere we can access user detail
        req.user = user;
        res.locals.user = user // For server Side Rendering we can access in pug template
        next();

    } catch (error) {
        debugger
        next(error)
    }
}

exports.AuthorizedProtect = (...roles) => {
    return (req, res, next) => {
        try {
            //req.user.role will send from "AuthProtect"
            if (!roles.includes(req.user.role)) {
                return next(new AppError("You do not have permission to perform this action", 403));
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        //1. find user based on email
        const user = await Users.findOne({ email: req.body.email });

        if (!user) {
            return next(new AppError("There is no user with email address", 404));
        }
        //2. Generate reset token
        const ResetToken = user.createPasswordResetToken();

        //.save is basically work as updateOne/Insert
        //if _id present then it will fire updateOne
        //else it will insert data
        //but we use this becuase we have to set option "validateBeforeSave:false"
        //so it will skip all the validation for required field and all.
        await user.save({ validateBeforeSave: false });

        //3. Send it to user email
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${ResetToken}`
        const message = `Forgot your password? submit a patch request 
        with your new password and passwordConfirm to: ${resetUrl}.
        if you did not forgot password, please ignore this email!`

        try {
            await SendMail({
                email: user.email,
                subject: "Password reset token (valid for 10 min)!!",
                message
            })

            res.status(200).json({
                status: 'success',
                message: "Token sent to mail successfully!!"
            });
        } catch (error) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return next(new AppError("There was an error sending email. Please try again later.", 500));
        }


    } catch (error) {
        next(error);
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const hashtoken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await Users.findOne({ passwordResetToken: hashtoken, passwordResetExpires: { $gt: Date.now() } });

        if (!user) {
            return next(new AppError("Token is invalid or expired!!"));
        }

        user.password = req.body.newpassword;
        user.confirmPassword = req.body.newpassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        createTokenAndSendAsResponse(res, user._id, 200);

    } catch (error) {
        next(error);
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        //1. Get User from collection
        const user = await Users.findById(req.user.id).select('+password');

        if (!user) {
            next(new AppError("User not found", 400));
        }

        //2. Check if Posted current password is correct
        if (!await user.checkPassword(req.body.oldpassword, user.password)) {
            return next(new AppError("Password is invalid!!", 400));
        }

        //3. If password correct, Update password
        user.password = req.body.newpassword
        user.confirmPassword = req.body.newpassword
        await user.save();

        //4. Log User in , Send JWT
        createTokenAndSendAsResponse(res, user._id, 200);
    } catch (error) {
        next(error);
    }
}

const filterBodyFields = (obj, ...validKeys) => {
    try {
        const newObj = {};

        Object.keys(obj).forEach(key => {
            newObj[key] = obj[key];
        })
        return newObj;

    } catch (error) {
        throw new AppError("Something went wrong", 500);
    }
}

exports.changeUserDetails = async (req, res, next) => {
    try {
        console.log(req.body);
        console.log(req.file);

        //1. Remove unwanted fields from object only needed fields which are allowed to update the user
        const filterBody = filterBodyFields(req.body, "name", "email");

        //201
        //now before this we only allow name and email fields from body to update data
        //now we will also store image name as image
        if (req.file) {
            filterBody.photo = req.file.filename
        }

        //2. Update User detail
        await Users.updateOne({ _id: req.user.id }, filterBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
        })

    } catch (error) {
        next(error);
    }
}

exports.deleteMyAccount = async (req, res, next) => {
    try {
        await Users.updateOne({ _id: req.user.id }, { isActive: false });

        res.status(204).json({ status: "success", data: null })

    } catch (error) {
        next(error);
    }
}
