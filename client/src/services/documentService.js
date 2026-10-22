import api from './api';

export const uploadFile = async (file, purpose = 'marksheet') => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('purpose', purpose);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.document;
};

export const uploadResume = async (file) => {
  return uploadFile(file, 'resume');
};

export default {
  uploadFile,
  uploadResume,
};
