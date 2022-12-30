const { HttpError } = require("../error");
const { errorHandler } = require("../util");
const models = require("../models");
const jwt = require("jsonwebtoken");


const verifyAccessToken = errorHandler((req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decodedToken.userId;
    next();
  } catch (e) {
    throw new HttpError(401, "Unauthorized");
  }
})

const verifyAdminRole = errorHandler((req, res, next) => {
  const userDoc = models.User.findById(req.userId).exec();

  if(!userDoc){
    throw new HttpError(401, "Unauthorized");
  }

  if(userDoc.is_admin) {
    throw new HttpError(401, "You are not unauthorized as admin!");
  }
  next();
});


module.exports = {verifyAccessToken, verifyAdminRole}