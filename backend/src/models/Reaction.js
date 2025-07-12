module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define('Reaction', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_reacoe',
      primaryKey: true,
      autoIncrement: true
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
      allowNull: false
    }
  }, {
    tableName: 'Reaction',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_utilizador', 'id_comentario'],
        name: 'UC_Raction'
      }
    ]
  });

  Reaction.associate = function(models) {
    Reaction.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
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