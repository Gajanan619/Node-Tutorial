const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');



const router = express.Router();

router.use(authController.AuthProtect);

router
  .route('/')
  .get(authController.AuthorizedProtect("admin"), userController.getAllUsers)

router
  .route('/:id')
  .get(authController.AuthorizedProtect("user"), userController.findMe)

  //199 
  //so multer is basically a middleware for upload file
  //so this middleware upload file in the folder and then it will add some useful information
  //into current request which we can access in next middleware using "req.file"
  //and if you want to send file as req data we can not pass using normal body data
  //we have to use "form data" in postman also we have body >> form-data 
  .patch(authController.AuthorizedProtect("user,admin"), userController.updateMe)
  .delete(authController.AuthorizedProtect("user,admin"), userController.deleteMe);

module.exports = router;
