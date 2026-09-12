import { apiClient } from './apiClient';

export async function downloadFile(fileId: string, fileName: string) {
  const blob = await apiClient.getBlob(`/api/files/${fileId}/download`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}