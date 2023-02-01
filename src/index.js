const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('nodelms:index');

const config = require('./config/config');
const app = require('./config/express');

// plugin bluebird promise in mongoose
mongoose.Promise = global.Promise;

// connect to mongo db
const mongoUri = config.mongo.uri;
const mongoOptions = config.mongo.options;

mongoose.connect(mongoUri, mongoOptions);
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// listen on port config.port
app.listen(config.port, () => {
  console.info(`Express is running on port ${config.port} (${config.env})`); // eslint-disable-line no-console
});

module.exports = app;
