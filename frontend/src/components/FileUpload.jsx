// src/components/FileUpload.jsx
import React, { useState } from 'react';
import { Button, ProgressBar, Alert } from 'react-bootstrap';
import { api } from '../services/authService';

const FileUpload = ({ onUploadSuccess, onUploadError, uploadType = 'course-resource', acceptedFiles = "*" }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');

    const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho do arquivo
    const maxSize = uploadType === 'course-image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB para imagens, 10MB para outros
    if (file.size > maxSize) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
        return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post(`/upload/${uploadType}`, formData, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
            },
        });

        if (response.data.success) {
            onUploadSuccess(response.data.file);
        } else {
            setError(response.data.message || 'Erro no upload');
            onUploadError && onUploadError(response.data.message);
        }
        } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erro ao fazer upload do arquivo';
        setError(errorMessage);
        onUploadError && onUploadError(errorMessage);
        } finally {
        setUploading(false);
        setProgress(0);
        // Limpar input
        event.target.value = '';
        }
    };

    return (
        <div className="file-upload-component">
        {error && <Alert variant="danger" className="mb-2">{error}</Alert>}
        
        <div className="d-flex align-items-center gap-2">
            <Button
            variant="outline-primary"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('file-input').click()}
            >
            {uploading ? 'Enviando...' : 'Escolher Arquivo'}
            </Button>
            
            <input
            id="file-input"
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
