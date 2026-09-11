export type SearchCategory = 'All' | 'Documents' | 'Folders' | 'Images' | 'Spreadsheets';

const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'md'];
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
const spreadsheetExtensions = ['xls', 'xlsx', 'csv'];

export function getCategory(name: string, type: 'Folder' | 'File'): SearchCategory {
  if (type === 'Folder') return 'Folders';
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (documentExtensions.includes(ext)) return 'Documents';
  if (imageExtensions.includes(ext)) return 'Images';
  if (spreadsheetExtensions.includes(ext)) return 'Spreadsheets';
  return 'All';
}