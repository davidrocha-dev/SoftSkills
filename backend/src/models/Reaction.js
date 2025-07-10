// models/Reaction.js
module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define('Reaction', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_reacoe',
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
    commentId: {
      type: DataTypes.INTEGER,
      field: 'id_comentario',
      allowNull: false,
      references: {
        model: 'Comment',
        key: 'id_comentario'
      }
    },
    type: {
      type: DataTypes.BOOLEAN,
      field: 'tipo',
      allowNull: false,
      validate: {
        isIn: [[0, 1]] // 0=Dislike, 1=Like
      }
    }
  }, {
    tableName: 'Reaction',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['n_trabalhador', 'id_comentario'],
        name: 'UC_Raction'
      }
    ]
  });

  // Associações
  Reaction.associate = function(models) {
    Reaction.belongsTo(models.User, {
      foreignKey: 'n_trabalhador',
      targetKey: 'workerNumber',
      as: 'user'
    });

    Reaction.belongsTo(models.Comment, {
      foreignKey: 'id_comentario',
      targetKey: 'id',
      as: 'Comment'
    });
  };

  return Reaction;
};