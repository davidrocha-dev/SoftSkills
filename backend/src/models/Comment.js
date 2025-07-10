// models/Comment.js
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_comentario',
      primaryKey: true,
      autoIncrement: true
    },
    topicId: {
      type: DataTypes.INTEGER,
      field: 'id_topico',
      allowNull: false,
      references: {
        model: 'Topic',
        key: 'id_topico'
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
    parentCommentId: {
      type: DataTypes.INTEGER,
      field: 'id_comentario_pai',
      allowNull: true,
      references: {
        model: 'Comment',
        key: 'id_comentario'
      }
    },
    commentDate: {
      type: DataTypes.DATEONLY,
      field: 'Data_Comentario',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    content: {
      type: DataTypes.STRING(255),
      field: 'Conteudo',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
  }, {
    tableName: 'Comment',
    timestamps: false
  });

  // Associações
  Comment.associate = function(models) {
    Comment.belongsTo(models.Topic, {
      foreignKey: 'id_topico',
      targetKey: 'id',
      as: 'topic'
    });

    Comment.belongsTo(models.User, {
      foreignKey: 'id_utilizador', 
      targetKey: 'id', 
      as: 'user'
    });

    Comment.belongsTo(models.Comment, {
      foreignKey: 'id_comentario_pai',
      targetKey: 'id',
      as: 'parentComment'
    });

    Comment.hasMany(models.Comment, {
      foreignKey: 'id_comentario_pai',
      as: 'replies'
    });

    Comment.hasMany(models.Reaction, {
      foreignKey: 'id_comentario',
      as: 'Reaction'
    });

    Comment.hasMany(models.Report, {
      foreignKey: 'id_comentario',
      as: 'Report'
    });
  };

  return Comment;
};
