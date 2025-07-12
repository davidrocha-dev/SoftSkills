module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_notificacao',
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(50),
      field: 'tipo',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    message: {
      type: DataTypes.STRING(255),
      field: 'mensagem',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    sendDate: {
      type: DataTypes.DATEONLY,
      field: 'data_envio',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    workerNumber: {
      type: DataTypes.STRING(50),
      field: 'n_trabalhador',
      allowNull: false,
      references: {
        model: 'User',
        key: 'n_trabalhador'
      }
    },
    seen: {
      type: DataTypes.BOOLEAN,
      field: 'vista',
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'Notificacao',
    timestamps: false
  });

  Notification.associate = function(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'n_trabalhador',
      targetKey: 'workerNumber',
      as: 'user'
    });
  };

  return Notification;
};
