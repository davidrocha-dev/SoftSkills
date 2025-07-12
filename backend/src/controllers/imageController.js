exports.uploadImage = (req, res) => {
  console.log('[uploadImage] req.file:', req.file);
  if (!req.file) {
    console.warn('[uploadImage] Nenhuma imagem enviada');
    return res.status(400).json({ success: false, error: 'Nenhuma imagem enviada' });
  }

  const imageUrl = req.file.path;
  console.log('[uploadImage] URL da imagem:', imageUrl);
  return res.status(200).json({ success: true, imageUrl });
};