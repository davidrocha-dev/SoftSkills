module.exports = (sequelize, DataTypes) => {
  const Enrollment = sequelize.define('Enrollment', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_inscricao',
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      field: 'id_curso',
      allowNull: false,
      references: {
        model: 'Course',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      field: 'id_utilizador',
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    enrollmentDate: {
      type: DataTypes.DATEONLY,
      field: 'Data_Inscricao',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING(8),
      field: 'Estado_Inscricao',
      allowNull: true,
      defaultValue: 'Pendente',
      validate: {
        isIn: [['Inativo', 'Ativo', 'Pendente']]
      }
    },
    rating: {
      type: DataTypes.DECIMAL(3,2),
      field: 'rating',
      allowNull: true,
      validate: {
        min: 0.00,
        max: 5.00
      }
    }
  }, {
    tableName: 'Enrollment',
    timestamps: false
  });

  Enrollment.associate = function(models) {
    Enrollment.belongsTo(models.Course, {
      foreignKey: 'courseId',
      targetKey: 'id',
      as: 'course'
    });

    Enrollment.belongsTo(models.User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user'
    });
  };

  return Enrollment;
};
