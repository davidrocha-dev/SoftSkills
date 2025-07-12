module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_area',
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING(255),
      field: 'descricao',
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'id_categoria',
      allowNull: false,
      references: {
        model: 'Category',
        key: 'id_categoria'
      }
    }
  }, {
    tableName: 'Area',
    timestamps: false
  });

  
  Area.associate = function(models) {
    Area.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    Area.hasMany(models.Topic, {
      foreignKey: 'areaId',
      as: 'topics'
    });
  };

  return Area;
};
