const { Op } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_curso',
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      field: 'titulo',
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    courseType: {
      type: DataTypes.BOOLEAN,
      field: 'tipo_curso',
      allowNull: false,
      defaultValue: false // false para assíncrono, true para síncrono
    },
    description: {
      type: DataTypes.TEXT,
      field: 'descricao',
      allowNull: false
    },
    instructor: {
      type: DataTypes.STRING(50),
      field: 'formador',
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'data_criacao',
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'data_atualizacao',
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      field: 'status',
      allowNull: false,
      defaultValue: true
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
    
    level: {
      type: DataTypes.STRING(50),
      field: 'nivel',
      allowNull: false,
      validate: {
        isIn: [['Básico', 'Intermédio', 'Avançado']]
      }
    },
    image: {
      type: DataTypes.STRING(255),
      field: 'imagem',
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATE,
      field: 'data_inicio',
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      field: 'data_fim',
      allowNull: false
    },
    hours: {
      type: DataTypes.INTEGER,
      field: 'horas',
      allowNull: true,
      validate: {
        min: 0
      }
    },
    vacancies: {
      type: DataTypes.INTEGER,
      field: 'vagas',
      allowNull: true,
      validate: {
        min: 0
      }
    },
    visible: {
      type: DataTypes.BOOLEAN,
      field: 'visible',
      allowNull: false,
      defaultValue: true
    },
    inscricoes: {
      type: DataTypes.BOOLEAN,
      field: 'inscricoes',
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'Course',
    timestamps: false
  });

  // Associações atualizadas
  Course.associate = function(models) {
  Course.belongsTo(models.Topic, { 
    foreignKey: 'topicId', 
    as: 'topic' 
  });
  
  Course.hasMany(models.Section, {
      foreignKey: 'courseId',
      as: 'sections'
    });
  
  Course.hasMany(models.Enrollment, { 
    foreignKey: 'courseId', 
    as: 'enrollments' 
  });
};

  // Hooks
  Course.beforeValidate((course, options) => {
    if (course.startDate && course.endDate && course.startDate > course.endDate) {
      throw new Error('A data de início não pode ser posterior à data de término');
    }
  });

  // Métodos de instância
  Course.prototype.getCourseTypeName = function() {
    return this.courseType ? 'Síncrono' : 'Assíncrono';
  };

  Course.prototype.getStatusName = function() {
    return this.status ? 'Ativo' : 'Inativo';
  };

  return Course;
};