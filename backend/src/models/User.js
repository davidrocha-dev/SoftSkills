module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_utilizador',
      primaryKey: true,
      autoIncrement: true
    },
    workerNumber: {
      type: DataTypes.STRING(50),
      field: 'n_trabalhador',
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Nº Trabalhador não pode ser vazio' }
      }
    },
    name: {
      type: DataTypes.STRING(255),
      field: 'nome_completo',
      allowNull: false
    },
    primaryRole: {
      type: DataTypes.ENUM('gestor', 'formador', 'formando'),
      field: 'tipo_utilizador',
      allowNull: false,
      defaultValue: 'formando'
    },
    email: {
      type: DataTypes.STRING(255),
      field: 'email',
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      field: 'password',
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'criado_em',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.BOOLEAN,
      field: 'status',
      allowNull: false,
      defaultValue: true
    },
    lastPasswordChange: {
      type: DataTypes.DATE,
      field: 'ultima_alteracao_senha',
      allowNull: true
    },
    pfp: {
      type: DataTypes.STRING(255),
      field: 'pfp',
      allowNull: true
    },
    forcePasswordChange: {
      type: DataTypes.BOOLEAN,
      field: 'force_password_change',
      allowNull: false,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      field: 'is_verified',
      allowNull: false,
      defaultValue: false
    },
    resetToken: {
      type: DataTypes.STRING(255),
      field: 'reset_token',
      allowNull: true
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      field: 'reset_token_expiry',
      allowNull: true
    },
    firstLoginToken: {
      type: DataTypes.STRING(512),
      field: 'first_login_token',
      allowNull: true
    },
    firstLoginTokenExpiry: {
      type: DataTypes.DATE,
      field: 'first_login_token_expiry',
      allowNull: true
    },
  }, {
    tableName: 'User',
    timestamps: false
  });

  User.associate = function(models) {
    User.hasMany(models.Enrollment, {
      foreignKey: 'id_utilizador',
      sourceKey: 'id',
      as: 'enrollments'
    });
  };

    User.associate = function(models) {
    User.hasMany(models.Comment, {
      foreignKey: 'id_utilizador',
      as: 'comments'
    });
  };

  return User;
};
