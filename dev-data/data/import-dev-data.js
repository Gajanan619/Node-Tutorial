const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../Model/TourModel');
const User = require('./../../Model/UserModel');
const Review = require('./../../Model/ReviewModel');

dotenv.config({ path: "../../config.env" });


const DB = process.env.DATABASE_REMOTE;
mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);

//Tour
// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// // User
// // READ JSON FILE
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
// );

// // IMPORT DATA INTO DB

// const importData = async () => {
//   try {
//     await User.create(users);
//     console.log('Data successfully loaded!');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };

// // DELETE ALL DATA FROM DB
// const deleteData = async () => {
//   try {
//     await User.deleteMany();
//     console.log('Data successfully deleted!');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };


// Review
// READ JSON FILE
// const users = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
// );

// // IMPORT DATA INTO DB

// const importData = async () => {
//   try {
//     await Review.create(users);
//     console.log('Data successfully loaded!');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };

// // DELETE ALL DATA FROM DB
// const deleteData = async () => {
//   try {
//     await Review.deleteMany();
//     console.log('Data successfully deleted!');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };


if (process.argv[2] === '--import') {
  importData();

} else if (process.argv[2] === '--delete') {
  deleteData();
}
