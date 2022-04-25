const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (val) {
                let regex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
                const result = regex.test(val)
                return result
            },
            message: "Add valid email address."
        }
    },
    photo: {
        type: String,
        default: "default.jpg" // 201 Set Default image
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password is should be 8 character."],
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, "Confirm Password is required"],
        validate: {
            validator: function (val) {
                return this.password == val;
            },
            message: "Confirm Password will be same as password"
        }
    },
    passwordChangedAt: {
        type: Date
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user",
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }

});

//Middleware
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    else {
        const encryptPassword = await bcrypt.hash(this.password, 12);
        this.password = encryptPassword;
        this.confirmPassword = undefined;
        next();
    }
});

UserSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    else {
        this.passwordChangedAt = Date.now();
        return next();
    }
});

//Using regex we try to catch all find methods
//so we can add filter which only get active users.
UserSchema.pre('/^find/', function (next) {
    this.find({ isActive: { $ne: false } });
    next();
})


//Instance Password
//We add middleware before and after some operations of query 
//but we can also add method which is only available for this schema
UserSchema.methods.checkPassword = async function (passwordToCheck,
    encryptPassword) {
    const a = await bcrypt.hash(passwordToCheck, 12);
    const restult = await bcrypt.compare(passwordToCheck, encryptPassword)
    return restult;
}

UserSchema.methods.passwordChangedAfter = function (passwordTimeStamp) {
    if (!this.passwordChangedAt) {
        return true;
    }

    return passwordTimeStamp > parseInt(this.passwordChangedAt.getTime() / 1000);
}

//So basically we can give password directly to the user
//But to here we can create temporary token from "crypto" module and then save to collection 
//so for that we add two field resetToken and resetTokenTime
//and token will only valid for 10min 
UserSchema.methods.createPasswordResetToken = function () {
    //Here we generate 32byte random string
    const resetTokenByte = crypto.randomBytes(32).toString('hex');

    //Then we encrypt this base64 string
    const encryptPassword = crypto.createHash('sha256').update(resetTokenByte).digest('hex');

    //now we will store 
    this.passwordResetToken = encryptPassword;
    this.passwordResetExpires = Date.now() + (10 * 60 * 1000);
    return resetTokenByte;
}

const Users = mongoose.model("Users", UserSchema);

module.exports = Users;
