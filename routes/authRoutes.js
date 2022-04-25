const { Signup, Login, forgotPassword, resetPassword, AuthProtect, cha, changePassword, changeUserDetails, deleteUser, deleteMyAccount, uploadUserPhoto } = require("../controllers/authController");
const Users = require("../Model/UserModel");
const AppError = require("../Model/AppError");



const Router = require("express").Router();

Router.post("/signup", Signup);
Router.post("/login", Login);
Router.post("/forgotPassword", forgotPassword);
Router.patch("/resetPassword/:token", resetPassword); //137

Router.patch("/changepassword", AuthProtect, changePassword);
//199 
//so multer is basically a middleware for upload file
//so this middleware upload file in the folder and then it will add some useful information
//into current request which we can access in next middleware using "req.file"
//and if you want to send file as req data we can not pass using normal body data
//we have to use "form data" in postman also we have body >> form-data 
Router.patch("/changeUserDetail", AuthProtect, uploadUserPhoto, changeUserDetails);
Router.delete("/deleteMyAccount", AuthProtect, deleteMyAccount);
module.exports = Router