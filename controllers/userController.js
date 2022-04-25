const User = require("../Model/UserModel");
const { FindDocumentById, UpdateDocumentById, DeleteDocumentById } = require("../util/Factory");


exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "sucess",
      data: users
    });

  } catch (error) {
    next(error)
  }
};

exports.findMe = FindDocumentById(User);
exports.updateMe = UpdateDocumentById(User);

exports.deleteMe = async (req, res, next) => {
  try {
    const users = await User.findByIdAndUpdate(req.user.id, { isActive: false });
    res.status(200).json({
      status: "sucess",
      data: users
    });

  } catch (error) {
    next(error)
  }
};