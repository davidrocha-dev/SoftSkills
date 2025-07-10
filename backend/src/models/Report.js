// models/Report.js
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      primaryKey: true,
      autoIncrement: true
    },
    commentId: {
      type: DataTypes.INTEGER,
      field: 'id_comentario',
      allowNull: false,
      references: {
        model: 'Comment',
        key: 'id_comentario'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'id_utilizador',
      allowNull: false,
      references: {
        model: 'User',
        key: 'id_utilizador'
      }
    },
    reportDate: {
      type: DataTypes.DATE,
      field: 'data_denuncia',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reason: {
      type: DataTypes.STRING(255),
      field: 'motivo',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      field: 'status',
      allowNull: false,
      defaultValue: false
      // validação removida para aceitar booleanos
    }
  }, {
    tableName: 'Report',
    timestamps: false
  });

  // Associações
  Report.associate = function(models) {
    Report.belongsTo(models.Comment, {
      foreignKey: 'id_comentario',
      targetKey: 'id',
      as: 'Comment'
    });

    Report.belongsTo(models.User, {
      foreignKey: 'id_utilizador',
      targetKey: 'id',
      as: 'User'
    });
  };

  return Report;
};