import api from './api';

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  try {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.file.url;
  } catch (err) {
    console.warn('Backend upload unavailable, using local document reader fallback.', err);
    // Local fallback: create an object URL or base64 representation
    return URL.createObjectURL(file);
  }
};
