module.exports.register = (res, req, next) => {
  // console.log(req.body);
  const { password, username, email } = req.body;
  const usernameCheck = await;
};
