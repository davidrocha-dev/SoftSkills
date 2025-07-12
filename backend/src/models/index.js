const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./User')(sequelize, require('sequelize').DataTypes);
const Category = require('./Category')(sequelize, require('sequelize').DataTypes);
const Area = require('./Area')(sequelize, require('sequelize').DataTypes);
const Certificate = require('./Certificate')(sequelize, require('sequelize').DataTypes);
const Comment = require('./Comment')(sequelize, require('sequelize').DataTypes);
const Course = require('./Course')(sequelize, require('sequelize').DataTypes);
const Enrollment = require('./Enrollment')(sequelize, require('sequelize').DataTypes);
const Interest = require('./Interest')(sequelize, require('sequelize').DataTypes);
const Notification = require('./Notification')(sequelize, require('sequelize').DataTypes);
const Reaction = require('./Reaction')(sequelize, require('sequelize').DataTypes);
const Report = require('./Report')(sequelize, require('sequelize').DataTypes);
const Resource = require('./Resource')(sequelize, require('sequelize').DataTypes);
const ResourceType = require('./ResourceType')(sequelize, require('sequelize').DataTypes);
const Section = require('./Section')(sequelize, require('sequelize').DataTypes);
const Topic = require('./Topic')(sequelize, require('sequelize').DataTypes);
const Request = require('./Request')(sequelize, require('sequelize').DataTypes);

const db = {
  User,
  Category,
  Area,
  Topic,
  Course,
  Section,
  ResourceType,
  Resource,
  Certificate,
  Enrollment,
  Notification,
  Interest,
  Comment,
  Reaction,
  Report,
  Request,
  sequelize
};

Object.values(db).forEach(model => {
  if (model.associate) {
    model.associate(db);
  }
});

module.exports = db;