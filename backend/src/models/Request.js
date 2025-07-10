module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    workerNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pendente', 'Resolvido'),
      defaultValue: 'Pendente'
    },
    resolutionDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'Requests',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  
  return Request;
};