const mongoose = require("mongoose");
const argon2 = require("argon2");
const models = require("../models");
const logger = require("../logger");

function errorHandler(fn) {
  return async function(req, res, next) {
    try {
      let nextCalled = false;
      const result = await fn(req, res, (params) => {
        nextCalled = true;
        next(params);
      });

      if (!res.headerSent && !nextCalled) {
        res.json(result);
      }
    } catch(e) {
      next(e);
    }
  }
}

function withTransaction(fn) {
  return async function(req, res, next) {
    let result;
    await mongoose.connection.transaction(async(session) => {
      result = await fn(req, res, session);
      return result;
    })

    return result;
  }
  
}

async function initiateAdmin() {
  const admin = await models.User.findOne({username: "admin", is_admin: true}).exec();

  if (!admin) {
    const userDoc = models.User({
      username: "admin",
      password: await argon2.hash("admin"),
      is_admin: true,
      country: "indonesia",
      city: "surabaya"
    });

    await userDoc.save();
    logger.info("admin is created successfully!")
  } else {
    logger.info("admin is already create");
  }
}

module.exports = {
  errorHandler,
  withTransaction,
  initiateAdmin
}