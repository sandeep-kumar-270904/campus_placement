import api from './api';

const auditLogService = {
  getAuditLogs: async (params = {}) => {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },

  exportAuditLogsCsv: async (params = {}) => {
    const res = await api.get('/admin/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    // Trigger browser file download
    const blob = new Blob([res.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default auditLogService;
