const db = require('../models');
const { Category, Area, Topic } = db;

exports.listCategories = async (req, res) => {
  try {
    // Consulta otimizada com eager loading e tratamento de n+1
    const categories = await db.Category.findAll({
      include: [{
        model: db.Area,
        as: 'areas',
        attributes: ['id', 'description'],
        separate: true, // Executa query separada para áreas
        include: [{
          model: db.Topic,
          as: 'topics',
          attributes: ['id', 'description'],
          separate: true // Query separada para tópicos
        }]
      }],
      attributes: ['id', 'description'],
      order: [['description', 'ASC']]
    });

    res.json(categories);
  } catch (error) {
    console.error('Erro detalhado ao buscar categorias:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql
    });
    
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Contate o administrador'
    });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: 'Descrição é obrigatória' });
    }
    
    const newCategory = await Category.create({ description });
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao criar categoria',
      error: error.message
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }
    
    if (!description) {
      return res.status(400).json({ message: 'Descrição é obrigatória' });
    }
    
    category.description = description;
    await category.save();
    return res.json(category);
  } catch (error) {
    console.error('Erro ao editar categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao editar categoria',
      error: error.message
    });
  }
};

exports.checkFk = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await Category.findByPk(id, {
      include: [{ 
        model: Area, 
        as: 'areas'
      }]
    });

    if (!categoria) {
      return res.json({ hasFk: false });
    }

    // Verifica se há áreas associadas
    const hasAssociatedAreas = categoria.areas && categoria.areas.length > 0;
    
    // Se houver áreas, verifica se alguma delas tem tópicos
    let hasAssociatedTopics = false;
    if (hasAssociatedAreas) {
      const areaIds = categoria.areas.map(area => area.id);
      const topicsCount = await Topic.count({
        where: { areaId: areaIds }
      });
      hasAssociatedTopics = topicsCount > 0;
    }

    return res.json({ 
      hasFk: (hasAssociatedAreas || hasAssociatedTopics) 
    });
  } catch (error) {
    console.error('Erro ao verificar FK:', error);
    return res.status(500).json({ 
      message: 'Erro interno no servidor',
      error: error.message
    });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const categoria = await Category.findByPk(id);
    
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    await categoria.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return res.status(500).json({
      message: 'Erro interno ao excluir categoria',
      error: error.message
    });
  }
};