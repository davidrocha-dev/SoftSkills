// models/Resource.js
module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_recurso',
      primaryKey: true,
      autoIncrement: true
    },
    sectionId: {
      type: DataTypes.INTEGER,
      field: 'id_seccao',
      allowNull: false,
      references: {
        model: 'Section',
        key: 'id_seccao'
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      field: 'id_tipo',
      allowNull: false,
      references: {
        model: 'ResourceType',
        key: 'id_tipo'
      }
    },
    title: {
      type: DataTypes.STRING(100),
      field: 'titulo',
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    order: {
      type: DataTypes.INTEGER,
      field: 'ordem_recurso',
      allowNull: true
    },
    text: {
      type: DataTypes.TEXT,
      field: 'texto',
      allowNull: true
    },
    file: {
      type: DataTypes.STRING(255),
      field: 'ficheiro',
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    link: {
      type: DataTypes.STRING(255),
      field: 'link',
      allowNull: true,
      validate: {
        len: [0, 255]
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'data_criacao',
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Resource',
    timestamps: false
  });

  // Associações
  Resource.associate = models => {
    Resource.belongsTo(models.Section, {
      foreignKey: 'sectionId',
      as: 'section'
    });
    Resource.belongsTo(models.ResourceType, {
      foreignKey: 'typeId',
      as: 'ResourceType'  // Associando com ResourceType, não Course
    });
  };

  return Resource;
};
