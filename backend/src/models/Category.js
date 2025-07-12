module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_categoria',
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING(255),
      field: 'descricao',
      allowNull: false
    }
  }, {
    tableName: 'Category',
    timestamps: false
  });

  Category.associate = function(models) {
    Category.hasMany(models.Area, {
      foreignKey: 'categoryId',
      as: 'areas'
    });
  };

  return Category;
};