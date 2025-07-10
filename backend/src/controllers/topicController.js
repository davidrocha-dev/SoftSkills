const { Topic, Area, Course, Resource } = require('../models');

exports.listTopics = async (req, res) => {
  try {
    const { areaId } = req.query;

    const whereClause = areaId ? { areaId } : {};

    const topics = await Topic.findAll({
      where: whereClause,
      include: [{
        model: Area,
        as: 'area',
        attributes: ['id', 'description']
      }],
      attributes: ['id', 'description'],
      order: [['id', 'ASC']]
    });

    res.json(topics);
  } catch (error) {
    console.error('Erro ao buscar tópicos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { description, areaId } = req.body;
    if (!description || !areaId) {
      return res.status(400).json({
        message: 'Descrição e areaId são obrigatórios'
      });
    }
    const newTopic = await Topic.create({ description, areaId });
    const topic = await Topic.findByPk(newTopic.id, {
      include: [{
        model: Area,
        as: 'area',
        attributes: ['id', 'description']
      }]
    });
    return res.status(201).json(topic);
  } catch (error) {
    return res.status(500).json({
      message: 'Erro interno ao criar tópico',
      error: error.message
    });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, areaId } = req.body;
    const topic = await Topic.findByPk(id);
    if (!topic) {
      return res.status(404).json({ message: 'Tópico não encontrado' });
    }
    if (!description || !areaId) {
      return res.status(400).json({
        message: 'Descrição e areaId são obrigatórios'
      });
    }
    topic.description = description;
    topic.areaId = areaId;
    await topic.save();
    await topic.reload({
      include: [{
        model: Area,
        as: 'area',
        attributes: ['id', 'description']
      }]
    });
    return res.json(topic);
  } catch (error) {
    console.error('Erro ao editar tópico:', error);
    return res.status(500).json({
      message: 'Erro interno ao editar tópico',
      error: error.message
    });
  }
};

exports.checkFk = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifique se há cursos associados (recursos não têm relação direta)
    const courses = await Course.count({ where: { topicId: id } });
    
    return res.json({ 
      hasFk: courses > 0
    });
  } catch (err) {
    console.error('Erro ao verificar FK:', err);
    return res.status(500).json({ 
      error: 'Erro ao verificar FK',
      details: err.message 
    });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByPk(id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Tópico não encontrado' });
    }

    // Verifique apenas cursos associados
    const courses = await Course.count({ where: { topicId: id } });
    
    if (courses > 0) {
      return res.status(400).json({
        message: 'Não é possível excluir o tópico porque existem cursos associados'
      });
    }

    await topic.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir tópico:', error);
    return res.status(500).json({
      message: 'Erro interno ao excluir tópico',
      error: error.message
    });
  }
};