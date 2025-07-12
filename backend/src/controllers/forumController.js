const { Topic, Comment, User, Reaction, Area, Category, Report } = require('../models');
const { Op } = require('sequelize');

exports.getTopics = async (req, res) => {
  try {
    console.log('A buscar tópicos do fórum...');
    const topics = await Topic.findAll({
      include: [
        {
          model: Area,
          as: 'area',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['description']
            }
          ]
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'pfp']
            },
            {
              model: Reaction,
              as: 'Reaction'
            }
          ]
        }
      ]
    });

    let mainComments = [];
    topics.forEach(topic => {
      (topic.comments || []).forEach(comment => {
        if (comment.parentCommentId == null && comment.status === true) {
          mainComments.push({ topic, comment });
        }
      });
    });

    let result = mainComments.map(({ topic, comment }) => {
      function buildReplies(comments, parentId) {
        return comments
          .filter(c => c.parentCommentId === parentId)
          .map(reply => ({
            id: reply.id,
            content: reply.content,
            ficheiro: reply.ficheiro,
            authorName: reply.user?.name || 'Desconhecido',
            authorAvatar: reply.user?.pfp || '',
            date: reply.commentDate,
            Reaction: reply.Reaction || [],
            replies: buildReplies(comments, reply.id)
          }));
      }

      const replies = buildReplies(topic.comments || [], comment.id);
      let likes = 0, dislikes = 0;
      (topic.comments || []).forEach(c => {
        c.Reaction?.forEach(reaction => {
          if (reaction.type) likes++;
          else dislikes++;
        });
      });

      return {
        id: comment.id,
        topicId: topic.id,
        topicTitle: topic.description,
        authorName: comment.user?.name || 'Desconhecido',
        authorAvatar: comment.user?.pfp || '',
        authorId: comment.user?.id || null,
        category: topic.area?.category?.description || '',
        area: topic.area?.description || '',
        title: topic.description,
        description: topic.description,
        date: comment.commentDate || '',
        commentsCount: (topic.comments || []).length,
        likes,
        dislikes,
        firstComment: {
          id: comment.id,
          content: comment.content,
          ficheiro: comment.ficheiro,
          authorName: comment.user?.name || 'Desconhecido',
          authorAvatar: comment.user?.pfp || '',
          authorId: comment.user?.id || null,
          date: comment.commentDate,
          Reaction: comment.Reaction || [],
          replies
        }
      };
    });

    const { category, search, sort } = req.query;
    if (category && category !== 'Todos') {
      result = result.filter(topic => topic.category === category);
    }

    if (search && search.trim() !== '') {
      const s = search.trim().toLowerCase();
      result = result.filter(topic =>
        topic.title.toLowerCase().includes(s) ||
        (topic.firstComment && topic.firstComment.content && topic.firstComment.content.toLowerCase().includes(s))
      );
    }

    if (sort === 'recent') {
      result = result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === 'oldest') {
      result = result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    res.json({ topics: result });
  } catch (err) {
    console.error('ERRO AO BUSCAR TÓPICOS:', err);
    res.status(500).json({ error: 'Erro ao buscar tópicos', details: err.message });
  }
};

exports.createReaction = async (req, res) => {
  try {
    const { commentId, type, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: 'commentId e userId são obrigatórios.' });
    }
    
    let reactionType;
    if (typeof type === 'boolean') {
      reactionType = type;
    } else if (type === 0 || type === '0' || type === false) {
      reactionType = false;
    } else if (type === 1 || type === '1' || type === true) {
      reactionType = true;
    } else {
      return res.status(400).json({ error: 'Tipo de reação inválido. Use true/false, 1/0.' });
    }

    let reaction = await Reaction.findOne({ where: { commentId, userId } });
    if (reaction) {
      if (reaction.type === reactionType) {
        await reaction.destroy();
        return res.json({ success: true, deleted: true });
      } else {
        reaction.type = reactionType;
        await reaction.save();
        return res.json({ success: true, updated: true });
      }
    } else {
      await Reaction.create({ commentId, userId, type: reactionType });
      return res.json({ success: true, created: true });
    }
  } catch (err) {
    console.error('ERRO AO REGISTAR REAÇÃO:', err);
    res.status(500).json({ error: 'Erro ao registar reação', details: err.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { topicId, content, userId, parentCommentId, ficheiro } = req.body;
    if (!topicId || !content) {
      return res.status(400).json({ error: 'topicId e content são obrigatórios.' });
    }

    const now = new Date();
    const comment = await Comment.create({
      topicId,
      content,
      parentCommentId: parentCommentId || null,
      userId: userId || 1,
      commentDate: now,
      ficheiro: ficheiro || null
    });

    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar comentário', details: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    console.log('POST /reports body:', req.body);
    const { commentId, userId, reason } = req.body;
    if (!commentId || !userId) {
      console.log('Dados obrigatórios em falta:', { commentId, userId });
      return res.status(400).json({ error: 'commentId e userId são obrigatórios.' });
    }

    const now = new Date();
    const report = await Report.create({
      commentId,
      userId,
      reason: reason || '',
      reportDate: now,
      status: false
    });

    console.log('Report criado:', report);
    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error('ERRO AO DENUNCIAR:', err);
    res.status(500).json({ error: 'Erro ao denunciar comentário', details: err.message });
  }
};

exports.getTopicsList = async (req, res) => {
  try {
    const topics = await Topic.findAll({
      attributes: ['id', 'description']
    });
    res.json({ topics });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar tópicos', details: err.message });
  }
};

exports.getPendingComments = async (req, res) => {
  try {
    const pendingComments = await Comment.findAll({
      where: { 
        status: false,
        parentCommentId: null
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'workerNumber']
        },
        {
          model: Topic,
          as: 'topic',
          include: [
            {
              model: Area,
              as: 'area',
              include: [
                {
                  model: Category,
                  as: 'category',
                  attributes: ['description']
                }
              ]
            }
          ]
        }
      ],
      order: [['commentDate', 'ASC']]
    });

    const formattedComments = pendingComments.map(comment => ({
      id: comment.id,
      content: comment.content,
      commentDate: comment.commentDate,
      authorName: comment.user?.name || 'Desconhecido',
      workerNumber: comment.user?.workerNumber || '',
      topicTitle: comment.topic?.description || '',
      category: comment.topic?.area?.category?.description || '',
      area: comment.topic?.area?.description || '',
      parentCommentId: comment.parentCommentId
    }));

    res.json({ 
      success: true, 
      pendingComments: formattedComments 
    });
  } catch (err) {
    console.error('ERRO AO BUSCAR COMENTÁRIOS PENDENTES:', err);
    res.status(500).json({ error: 'Erro ao buscar comentários pendentes', details: err.message });
  }
};

exports.moderateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida. Use "approve" ou "reject".' });
    }

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }

    if (action === 'approve') {
      comment.status = true;
      await comment.save();
      res.json({ success: true, message: 'Comentário aprovado com sucesso.' });
    } else {
      await comment.destroy();
      res.json({ success: true, message: 'Comentário rejeitado e eliminado.' });
    }
  } catch (err) {
    console.error('ERRO AO MODERAR COMENTÁRIO:', err);
    res.status(500).json({ error: 'Erro ao moderar comentário', details: err.message });
  }
};

exports.getPendingReports = async (req, res) => {
  try {
    const pendingReports = await Report.findAll({
      where: { status: false },
      include: [
        {
          model: Comment,
          as: 'Comment',
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'workerNumber']
            },
            {
              model: Topic,
              as: 'topic',
              include: [
                {
                  model: Area,
                  as: 'area',
                  include: [
                    {
                      model: Category,
                      as: 'category',
                      attributes: ['description']
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'User',
          attributes: ['name', 'workerNumber']
        }
      ],
      order: [['reportDate', 'ASC']]
    });

    const formattedReports = pendingReports.map(report => ({
      id: report.id,
      reason: report.reason,
      reportDate: report.reportDate,
      reporterName: report.User?.name || 'Desconhecido',
      reporterWorkerNumber: report.User?.workerNumber || '',
      commentId: report.commentId,
      commentContent: report.Comment?.content || '(Comentário removido)',
      commentAuthorName: report.Comment?.user?.name || '(Comentário removido)',
      commentAuthorWorkerNumber: report.Comment?.user?.workerNumber || '',
      topicTitle: report.Comment?.topic?.description || '(Comentário removido)',
      category: report.Comment?.topic?.area?.category?.description || '',
      area: report.Comment?.topic?.area?.description || ''
    }));

    res.json({ 
      success: true, 
      pendingReports: formattedReports 
    });
  } catch (err) {
    console.error('ERRO AO BUSCAR DENÚNCIAS PENDENTES:', err);
    res.status(500).json({ error: 'Erro ao buscar denúncias pendentes', details: err.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    if (!action || !['dismiss', 'remove_comment'].includes(action)) {
      return res.status(400).json({ error: 'Ação inválida. Use "dismiss" ou "remove_comment".' });
    }

    const report = await Report.findByPk(id, {
      include: [
        {
          model: Comment,
          as: 'Comment'
        }
      ]
    });

    if (!report) {
      return res.status(404).json({ error: 'Denúncia não encontrada.' });
    }

    if (action === 'dismiss') {
      report.status = true;
      await report.save();
      res.json({ success: true, message: 'Denúncia arquivada com sucesso.' });
    } else {
      if (report.Comment) {
        await report.Comment.destroy();
      }
      report.status = true;
      await report.save();
      res.json({ success: true, message: 'Comentário removido e denúncia arquivada.' });
    }
  } catch (err) {
    console.error('ERRO AO RESOLVER DENÚNCIA:', err);
    res.status(500).json({ error: 'Erro ao resolver denúncia', details: err.message });
  }
}; 