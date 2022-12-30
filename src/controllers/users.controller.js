const argon2 = require("argon2");
const {errorHandler} = require("../util");
const models = require("../models");
const { HttpError } = require("../error");

const me = errorHandler(async (req, res) => {
  const userDoc = models.User.findById(req.userId).exec();
  
  if(!userDoc) {
    throw new HttpError(400, "User not found");
  }

  return userDoc;
});

const create = errorHandler(async (req, res) => {
  
  try {
    const userDoc = models.User({
      username: req.body.username,
      password: await argon2.hash(req.body.password),
      is_admin: req.body.is_admin,
      country: req.body.country,
      city: req.body.city
    });
  
    await userDoc.save();
  
    return {
      username: userDoc.username,
      password: userDoc.password,
      is_admin: userDoc.is_admin,
      country: userDoc.country,
      city: userDoc.city
    }
  } catch(e) {
    throw new HttpError(e.message);
  }

});

const get = errorHandler(async (req, res) => {
  const userId = req.params.userId

  try {
    const userDoc = await models.User.findById(userId).exec();
    if(!userDoc) {
      throw new HttpError(404, "User not found!");
    }

    return userDoc;
  } catch(e) {
    if (e.name === "CastError") {
      throw new HttpError(401, "invalid user id!");
    } else if (e.name === "CustomHttpError") {
      throw new HttpError(e.statusCode, e.message);
    } else {
      throw new HttpError(500, e.message);
    }
  }
});

const update = errorHandler(async (req, res) => {

  const data = req.body;
  const userId = req.params.userId;

  try {

    const userDoc = await models.User.findById(userId).exec();
    if(!userDoc) {
      throw new HttpError(404, "User not found!");
    }

    if (data.hasOwnProperty("username")) {
      userDoc.username = data.username;
    }

    if (data.hasOwnProperty("city")) {
      userDoc.city = data.city;
    }

    if (data.hasOwnProperty("country")){
      userDoc.country = data.country;
    }

    await userDoc.save();
    return userDoc;

  } catch(e) {
    if (e.name === "CastError") {
      throw new HttpError(401, "invalid id!");
    } else {
      throw new HttpError(500, e.message);
    }
  }
});

const remove = errorHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const userDoc = await models.User.findById(userId).exec();
    if(!userDoc) {
      throw new HttpError(404, "User not found!");
    }

    await userDoc.remove();

    return {message: "user has been removed!"}

  } catch (e) {
    if (e.name === "CastError") {
      throw new HttpError(401, "invalid user id!");
    } else if (e.name === "CustomHttpError") {
      throw new HttpError(e.statusCode, e.message);
    } else {
      throw new HttpError(500, e.message);
    }
  }
  
});

module.exports = {me, create, update, remove, get}