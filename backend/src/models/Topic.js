module.exports = (sequelize, DataTypes) => {
  const Topic = sequelize.define('Topic', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_topico',
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING(255),
      field: 'descricao',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    areaId: {
      type: DataTypes.INTEGER,
      field: 'id_area',
      allowNull: false,
      references: {
        model: 'Area',
        key: 'id_area'
      }
    }
  }, {
    tableName: 'Topic',
    timestamps: false,
  });

  Topic.associate = function(models) {
    Topic.belongsTo(models.Area, {
      foreignKey: 'areaId',
      as: 'area'
    });
    Topic.hasMany(models.Comment, {
      foreignKey: 'topicId',
      as: 'comments'
    });
  };

  return Topic;
};