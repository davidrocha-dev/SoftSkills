module.exports = (sequelize, DataTypes) => {
  const ResourceType = sequelize.define('ResourceType', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_tipo',
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING(255),
      field: 'tipo',
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(255),
      field: 'icon',
      allowNull: true
    }
  }, {
    tableName: 'ResourceType',
    timestamps: false
  });

  return ResourceType;
};