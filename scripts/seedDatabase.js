const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('seedDatabase');

const config = require('../src/config/config');
const models = require('../src/models');

mongoose.Promise = global.Promise;

// connect to mongo db
const mongoUri = config.mongo.uri;
const mongoOptions = config.mongo.options;

mongoose.connect(mongoUri, mongoOptions);
mongoose.connection.on('error', (error) => {
  debug(`unable to connect to database: ${mongoUri}`, util.inspect(error, false, 20));
});

const seedUsers = [
  { username: 'martinholden', familyName: 'Holden', firstName: 'Martin', active: true },
  { username: 'sarahholden', familyName: 'Holden', firstName: 'Sarah', active: true },
];

const seedContent = [
  {
    type: 'Compliance',
    code: 'ehs_hsf_c97_sh_enus',
    title: 'PPE: Personal Protective Equipment 2.0',
    launchurl:
      'https://www.skillsoftcompliance.com/academy/TPLMS_LaunchAICC.aspx?action=launch&orgId=555902&courseId=77105655',
  },
  {
    type: 'Non-Compliance',
    code: '9a4d950e-f81b-4f0b-b73d-9160db57343e',
    title: 'Access 2019: Creating Forms & Queries',
    launchurl:
      'https://api.percipio.com/content-integration/v1/aicc/launch?contentId=9a4d950e-f81b-4f0b-b73d-9160db57343e&entitlementKey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXJ2aWNlX2FjY291bnRfaWQiOiI2NjcxMzU1NC0yZmQ0LTRkNjgtOGVmZS0yNDdlMzQzZTMwZjYiLCJvcmdhbml6YXRpb25faWQiOiI2NjcxMzU1NC0yZmQ0LTRkNjgtOGVmZS0yNDdlMzQzZTMwZjYiLCJpc3MiOiJhcGkucGVyY2lwaW8uY29tIiwiaWF0IjoxNjAyNjgwNDg5fQ.C5YWQOPCpW1OG5Lzt8CQAklFvVSgBPSXYuzBN1NP31s&contentType=course',
  },
  {
    type: 'Certitude',
    code: 'A0000',
    title: 'test for stand alone via ACCP',
    launchurl:
      'https://Certitude.skillsoftcompliance.com/player/?OrganizationID=9fa27e39-14e2-438e-a793-6bf596a636dc&MainProductID=b048989c-db87-4449-91bb-fb5781eedf8b&LanguageID=1033',
  },
];

const seedData = () => {
  const promises = seedUsers.map((value) => {
    return models.User.register(value, 'Welcome12345@');
  });

  promises.push(models.AiccContent.insertMany(seedContent));

  return Promise.allSettled(promises);
};

seedData().then((results) => {
  debug(util.inspect(results, false, 20));
  process.exit();
});
