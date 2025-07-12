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
  });

  Section.associate = models => {
    Section.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    Section.hasMany(models.Resource, {
      foreignKey: 'sectionId',
      as: 'resources'
    });
  };

  Section.beforeCreate(async section => {
    const maxOrder = await Section.max('order', {
      where: { courseId: section.courseId }
    });
    section.order = (Number(maxOrder) || 0) + 1;
  });

  Section.updateOrdersSafely = async (courseId, sectionsData) => {
    const transaction = await sequelize.transaction();
    
    try {
      for (const sectionData of sectionsData) {
        if (sectionData.id) {
          await Section.update(
            { order: sectionData.order + 10000 },
            { 
              where: { id: sectionData.id, courseId },
              transaction 
            }
          );
        }
      }
      
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
