const { ResourceType } = require('../models');

exports.listResourceTypes = async (req, res) => {
  try {
    const resourceTypes = await ResourceType.findAll({
      attributes: ['id', 'type', 'icon'],
      order: [['id', 'ASC']]
    });

    res.json(resourceTypes);
  } catch (error) {
    console.error('Erro ao buscar tipos de recursos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}; 