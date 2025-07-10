module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id_seccao',
      primaryKey: true,
      autoIncrement: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      field: 'id_curso',
      allowNull: false,
      references: {
        model: 'Course',
        key: 'id_curso'
      }
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
    order: {
      type: DataTypes.INTEGER,
      field: 'ordem',
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      field: 'status',
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'Section',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_curso', 'ordem']
      }
    ]
  });

  Section.associate = models => {
    Section.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // A associação com Resource deve ser feita aqui, após a definição de models
    Section.hasMany(models.Resource, {
      foreignKey: 'sectionId',
      as: 'resources'
    });
  };

  // Hook para definir a ordem da seção
  Section.beforeCreate(async section => {
    // Verificar a maior ordem existente para o curso
    const maxOrder = await Section.max('order', {
      where: { courseId: section.courseId }
    });
    section.order = (Number(maxOrder) || 0) + 1;  // Se não houver seções, começa de 1
  });

  return Section;
};
