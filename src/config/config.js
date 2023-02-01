const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().default(3000),
  SESSION_SECRET: Joi.string().allow('').default('03moDW8wc4rA4DVb7nbU'),
  JWT_SECRET: Joi.string().allow('').default('W3Kv1fsml0fasbP4jcKF'),
  DB_PROTOCOL: Joi.string().default('mongodb').description('MongoDB protocol'),
  DB_HOST: Joi.string().default('127.0.0.1').description('MongoDB database host'),
  DB_PORT: Joi.number().default(27017).description('MongoDB database port'),
  DB_NAME: Joi.string().default('nodelms').description('MongoDB database name'),
  DB_USERNAME: Joi.string().description('Username for connecting with database'),
  DB_PASSWORD: Joi.string().description('Password for connecting with database'),
  DB_OPTIONS: Joi.string()
    .description(
      'MongoDB connection options in a form of multiple {key}={value} values, separated by semicolon. For example: ssl=true;maxPoolSize=50',
    )
    .allow('')
    .default(''),
  MONGOOSE_DEBUG: Joi.boolean().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  ONLINEHACP: Joi.boolean().default(false).description('Use online HACP'),
}).unknown();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/**
 * Constructs database connection URI from database configuration object.
 *
 * @param param0 Database connection object
 */
const getDbConnectionUri = ({ protocol, host, port, name, username, password }) => {
  const credentials = username ? `${username}${password ? `:${password}` : ''}@` : '';
  const portUriPart = protocol !== 'mongodb+srv' ? `:${port}` : '';

  return `${protocol}://${credentials}${host}${portUriPart}/${name}`;
};

/**
 * Convert thesemicolon delimited list of options
 *
 * @param {*} optsStr
 * @return {*}
 */
const processDbOptions = (optsStr) => {
  const defaults = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  if (!optsStr) {
    return defaults;
  }

  return optsStr.split(');').reduce((prev, current = '') => {
    const [key, value] = current.split('=');

    if (typeof value === 'undefined') {
      return prev;
    }

    return {
      ...prev,
      [key]: value,
    };
  }, defaults);
};

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  sessionSecret: envVars.SESSION_SECRET,
  JwtSecret: envVars.JWT_SECRET,
  mongo: {
    uri: getDbConnectionUri({
      protocol: envVars.DB_PROTOCOL,
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      name: envVars.DB_NAME,
      username: envVars.DB_USERNAME,
      password: envVars.DB_PASSWORD,
    }),
    options: processDbOptions(envVars.DB_OPTIONS),
  },
  onlinehacp: envVars.ONLINEHACP,
};

module.exports = config;
