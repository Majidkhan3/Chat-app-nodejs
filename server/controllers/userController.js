// const User = require(""); // Ensure this path is correct
const bcrypt = require("bcrypt");
const Users = require("../model/userModel");

module.exports.register = async (req, res, next) => {
  try {
    const { password, username, email } = req.body;

    // Check if the username already exists
    const usernameCheck = await Users.findOne({ username });
    if (usernameCheck) {
      return res.json({ msg: "Username already in use", status: false });
    }

    const emailCheck = await Users.findOne({ email });
    if (emailCheck) {
      return res.json({ msg: "Email already in use", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Users.create({
      email,
      username,
      password: hashedPassword,
    });

    // Remove the password from the user object before sending the response
    const userResponse = { ...user._doc };
    delete userResponse.password;

    return res.json({ status: true, user: userResponse });
  } catch (ex) {
    next(ex);
  }
};
// FOr login Page

module.exports.login = async (req, res, next) => {
  try {
    const { password, username } = req.body;

    // Check if the username already exists
    const user = await Users.findOne({ username });
    if (!user) {
      console.log(user, "here is user");
      return res.json({ msg: "incorrect email or password", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect username or password", status: false });
    console.log(password, "here is the passsword");
    delete user.password;

    // Remove the password from the user object before sending the response

    return res.json({ status: true, user: user });
  } catch (ex) {
    next(ex);
  }
};
module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await Users.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage,
    });
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    next(ex);
  }
};
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await Users.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};
