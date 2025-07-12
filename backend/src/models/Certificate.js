module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_certificado',
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
    workerNumber: {
      type: DataTypes.STRING(50),
      field: 'n_trabalhador',
      allowNull: true,
      references: {
        model: 'User',
        key: 'n_trabalhador'
      }
    },
    grade: {
      type: DataTypes.INTEGER,
      field: 'nota',
      allowNull: false,
      validate: {
        min: 0,
        max: 20 
      }
    },
    observation: {
      type: DataTypes.STRING(50),
      field: 'obs',
      allowNull: true,
      validate: {
        len: [0, 50]
      }
    },
    pdfUrl: {
      type: DataTypes.TEXT,
      field: 'pdf_url',
      allowNull: true
    }
  }, {
    tableName: 'Certificate',
    timestamps: false
  });

  Certificate.associate = function(models) {
    Certificate.belongsTo(models.Course, {
      foreignKey: 'courseId',
      targetKey: 'id',
      as: 'course'
    });
    
    Certificate.belongsTo(models.User, {
      foreignKey: 'workerNumber',
      targetKey: 'workerNumber',
      as: 'user'
    });
  };

  return Certificate;
};
