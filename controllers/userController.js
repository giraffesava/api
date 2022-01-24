const User = require("./../models/userModel");

const catchAsync = require("./../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });

  // res.status(500).json({
  //   status: "error",
  //   message: "This route is not defined yet",
  // });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet",
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined yet",
  });
};
