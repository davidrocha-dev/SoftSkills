// models/Interest.js
module.exports = (sequelize, DataTypes) => {
  const Interest = sequelize.define('Interest', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_interesse',
      primaryKey: true,
      autoIncrement: true
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
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'id_categoria',
      allowNull: true,
      references: {
        model: 'Category',
        key: 'id_categoria'
      }
    },
    areaId: {
      type: DataTypes.INTEGER,
      field: 'id_area',
      allowNull: true,
      references: {
        model: 'Area',
        key: 'id_area'
      }
    },
    topicId: {
      type: DataTypes.INTEGER,
      field: 'id_topico',
      allowNull: true,
      references: {
        model: 'Topic',
        key: 'id_topico'
      }
    }
  }, {
    tableName: 'Interest',
    timestamps: false
  });

  // Associações
  Interest.associate = function(models) {
    Interest.belongsTo(models.User, {
      foreignKey: 'n_trabalhador',
      targetKey: 'workerNumber',
      as: 'user'
    });

    Interest.belongsTo(models.Category, {
      foreignKey: 'id_categoria',
      targetKey: 'id',
      as: 'category'
    });

    Interest.belongsTo(models.Area, {
      foreignKey: 'id_area',
      targetKey: 'id',
      as: 'area'
    });

    Interest.belongsTo(models.Topic, {
      foreignKey: 'id_topico',
      targetKey: 'id',
      as: 'topic'
    });
  };

  return Interest;
};
