import React, { useState } from 'react';
import { Button, ProgressBar, Alert } from 'react-bootstrap';
import { api } from '../services/authService';

const FileUpload = ({ onUploadSuccess, onUploadError, uploadType = 'course-resource', acceptedFiles = "*", buttonText = "Escolher Ficheiro", buttonSize = "sm" }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [fileInputId] = useState(`file-input-${Math.random().toString(36).substr(2, 9)}`);

    const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (uploadType === 'course-image') {
        if (!file.type.startsWith('image/')) {
            setError('Apenas ficheiros de imagem são permitidos');
            return;
        }
    }

    const maxSize = uploadType === 'course-image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Ficheiro muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
        return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const uploadUrl = uploadType === 'course-image' ? '/image' : '/upload/resource';
        
        const response = await api.post(uploadUrl, formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
            },
        });

        if (response.data.success) {
            const fileUrl = response.data.imageUrl || response.data.fileUrl || response.data.url;
            onUploadSuccess(fileUrl);
        } else {
            setError(response.data.message || 'Erro no upload');
            onUploadError && onUploadError(response.data.message);
        }
        } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erro ao fazer upload do ficheiro';
        setError(errorMessage);
        onUploadError && onUploadError(errorMessage);
        } finally {
        setUploading(false);
        setProgress(0);
        event.target.value = '';
        }
    };

    return (
        <div className="file-upload-component">
        {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
        
        <div className="d-flex align-items-center gap-2">
            <Button
            variant="outline-primary"
            size={buttonSize}
            disabled={uploading}
            onClick={() => document.getElementById(fileInputId).click()}
            >
            {uploading ? 'Enviando...' : buttonText}
            </Button>
            
            <input
            id={fileInputId}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            accept={acceptedFiles}
            />
        </div>

        {uploading && (
            <div className="mt-2">
            <ProgressBar now={progress} label={`${progress}%`} />
            </div>
        )}
        </div>
    );
};

export default FileUpload;
