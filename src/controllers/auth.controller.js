const jwt = require("jsonwebtoken")
const models = require("../models")
const argon2 = require("argon2");
const { errorHandler, withTransaction } = require("../util");
const { HttpError } = require("../error");

const signup = errorHandler(withTransaction(async (req, res, session) => {
  const userDoc = models.User({
    username: req.body.username,
    password: await argon2.hash(req.body.password),
    is_admin: req.body.is_admin,
    country: req.body.country,
    city: req.body.city
  });

  const refreshTokenDoc = models.RefreshToken({
    owner: userDoc.id
  });

  await userDoc.save({session});
  await refreshTokenDoc.save({session});

  const refreshToken =  createRefreshToken(userDoc.id, refreshTokenDoc.id);
  const accessToken = await createAccessToken(userDoc.id);

  return {
    id: userDoc.id,
    accessToken: accessToken,
    refreshToken: refreshToken
  };
}));

const login = errorHandler(withTransaction(async(req, res, session) => {
  username = req.body.username;
  rawPassword = req.body.password;

  const userDoc = await models.User
    .findOne({username: username})
    .select("password")
    .exec();
  
  if(!userDoc) {
    throw new HttpError(401, "Wrong username or password");
  }

  await verifyPassword(userDoc.password, rawPassword);

  const refreshTokenDoc = models.RefreshToken({
    owner: userDoc.id
  })

  await refreshTokenDoc.save({session});

  const refreshToken =  createRefreshToken(userDoc.id, refreshTokenDoc.id);
  const accessToken = await createAccessToken(userDoc.id);

  return {
    id: userDoc.id,
    accessToken: accessToken,
    refreshToken: refreshToken
  };

}));

const newRefreshToken = errorHandler(withTransaction(async (req, res, session) => {
  const currentRefreshToken = await validateRefreshToken(req.body.refreshToken);
  const refreshTokenDoc = models.RefreshToken({
    owner: currentRefreshToken.userId
  });

  await refreshTokenDoc.save({session});
  await models.RefreshToken.deleteOne({_id: currentRefreshToken.tokenId}, {session});

  const refreshToken = createRefreshToken(currentRefreshToken.userId, refreshTokenDoc.id);
  const accessToken = createAccessToken(currentRefreshToken.userId);

  return {
    id: currentRefreshToken.userId,
    accessToken: accessToken,
    refreshToken: refreshToken
  }
}));

const newAccessToken = errorHandler(async (req, res) => {
  
  const currentRefreshToken = await validateRefreshToken(req.body.refreshToken);
  const accessToken = createAccessToken(refreshToken.userId);

  return {
    id: currentRefreshToken.userId,
    accessToken: accessToken,
    refreshToken: req.body.refreshToken
  }
})

const logout = errorHandler(withTransaction( async (req, res, session) => {
  const currentRefreshToken = await validateRefreshToken(req.body.refreshToken);
  await models.RefreshToken.deleteOne({_id: currentRefreshToken.tokenId }, {session})

  return {success: true}
}));

const logoutAll = errorHandler(withTransaction( async (req, res, session) =>{
  const currentRefreshToken = await validateRefreshToken(req.body,refreshToken);
  await models.RefreshToken.deleteMany({owner: currentRefreshToken.userId}, {session})

  return {success: true}
}));

function createAccessToken(userId){
  return jwt.sign({
    userId: userId
  }, process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: "10m"
  });
}

function createRefreshToken(userId, refreshTokenId){
  return jwt.sign({
    userId: userId,
    tokenId: refreshTokenId
  }, process.env.REFRESH_TOKEN_SECRET, 
  {
    expiresIn: "30d"
  });
}

const verifyPassword = async (hashedPassword, rawPassword) => {
  let checkPassword = await argon2.verify(hashedPassword, rawPassword);
  
  if (checkPassword) {

  } else {
    throw new HttpError(401, "Wrong username or password");
  }
}

const validateRefreshToken = async (token) => {

  const decodeToken = () => {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
      throw new HttpError(401, "Unauthorized")
    }
  }

  const decodedToken = decodeToken();
  const tokenExist = await models.RefreshToken.findOne({_id: decodedToken.tokenId});

  if (tokenExist) {
    return decodedToken;
  } else {
    throw new HttpError(401, "Unauthorized");
  }
}

module.exports = {
  signup,
  login,
  newRefreshToken,
  newAccessToken,
  logout,
  logoutAll
}