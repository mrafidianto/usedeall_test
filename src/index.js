const express = require('express');
const connectToDatabase = require('./database');
const logger = require('./logger/index');
const app = express();
const port = process.env.PORT || 3000;
const routes = require('./routes');
const {initiateAdmin} = require("./util");

app.use(express.json());

app.use("/api",routes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.statusCode||500).send({error: err.message})
});

async function startServer() {
  await connectToDatabase();

  // initiate admin user if it doesn't exist
  await initiateAdmin();

  app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
  })
}

module.exports = startServer;