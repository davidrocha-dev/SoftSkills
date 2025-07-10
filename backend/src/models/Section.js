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
    timestamps: false
    // Removido o índice único que causava problemas de constraint
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

  // Método estático para atualizar ordens de forma segura
  Section.updateOrdersSafely = async (courseId, sectionsData) => {
    const transaction = await sequelize.transaction();
    
    try {
      // Fase 1: Atualizar todas as seções para ordens temporárias (evita conflitos)
      for (const sectionData of sectionsData) {
        if (sectionData.id) {
          await Section.update(
            { order: sectionData.order + 10000 }, // Ordem temporária alta
            { 
              where: { id: sectionData.id, courseId },
              transaction 
            }
          );
        }
      }
      
      // Fase 2: Atualizar para as ordens finais
      for (const sectionData of sectionsData) {
        if (sectionData.id) {
          await Section.update(
            { order: sectionData.order },
            { 
              where: { id: sectionData.id, courseId },
              transaction 
            }
          );
        }
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  // Método estático para reordenar seções automaticamente
  Section.reorderSections = async (courseId) => {
    const sections = await Section.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    });
    
    const transaction = await sequelize.transaction();
    
    try {
      for (let i = 0; i < sections.length; i++) {
        await Section.update(
          { order: i + 1 },
          { 
            where: { id: sections[i].id },
            transaction 
          }
        );
      }
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return Section;
};
