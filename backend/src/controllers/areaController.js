const { Area, Category, Topic} = require('../models/index');

// Exemplo correto de consulta com eager loading
exports.listAreas = async (req, res) => {
  try {
    const areas = await Area.findAll({
      include: [
        { 
          model: Category, 
          as: 'category'
        }
      ]
    });
    res.json(areas);
  } catch (error) {
    console.error('Erro ao buscar áreas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

exports.createArea = async (req, res) => {
  try {
    const { description, categoryId } = req.body;
    if (!description || !categoryId) {
      return res.status(400).json({ error: 'Descrição e categoryId são obrigatórios' });
    }

    const newArea = await Area.create({ description, categoryId });

    await newArea.reload({ include: ['category'] });

    return res.status(201).json(newArea);
  } catch (err) {
    console.error('Erro ao criar área:', err);
    return res.status(500).json({ error: 'Erro interno ao criar área' });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, categoryId } = req.body;
    const area = await Area.findByPk(id);
    if (!area) return res.status(404).json({ error: 'Área não encontrada' });
    area.description = description;
    area.categoryId = categoryId;
    await area.save();
    await area.reload({ include: ['category'] });
    return res.json(area);
  } catch (err) {
    console.error('Erro ao editar área:', err);
    return res.status(500).json({ error: 'Erro interno ao editar área' });
  }
};

exports.checkFk = async (req, res) => {
  try {
    const { id } = req.params;

    const area = await Area.findByPk(id, {
      include: [{ model: Topic, as: 'topics' }]
    });

    // Se a área não for encontrada, considere que não há FK
    if (!area) {
      return res.json({ hasFk: false });
    }

    // Se houver tópicos associados, retorne true
    if (area.topics && area.topics.length > 0) {
      return res.json({ hasFk: true });
    }

    return res.json({ hasFk: false });
  } catch (err) {
    console.error('Erro ao verificar FK:', err);
    return res.status(500).json({ 
      error: 'Erro ao verificar FK',
      details: err.message 
    });
  }
};

// Adicione esta função no final do arquivo
exports.deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifique se a área existe
    const area = await Area.findByPk(id);
    if (!area) {
      return res.status(404).json({ error: 'Área não encontrada' });
    }

    // Verifique se há tópicos associados
    const topics = await Topic.findAll({ where: { areaId: id } });
    if (topics.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir a área porque existem tópicos associados' 
      });
    }

    // Exclua a área
    await area.destroy();
    return res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error('Erro ao excluir área:', err);
    return res.status(500).json({ error: 'Erro interno ao excluir área' });
  }
};