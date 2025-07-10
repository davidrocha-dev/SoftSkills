module.exports = (sequelize, DataTypes) => {
  const Area = sequelize.define('Area', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_area', // Nome físico da coluna
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
        key: 'id_categoria' // Nome físico da coluna na tabela Category
      }
    }
  }, {
    tableName: 'Area',
    timestamps: false
  });

  // Associações
  Area.associate = function(models) {
    // Área pertence a uma categoria
    Area.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });

    // Área tem muitos tópicos
    Area.hasMany(models.Topic, {
      foreignKey: 'areaId',
      as: 'topics'
    });
  };

  return Area;
};
