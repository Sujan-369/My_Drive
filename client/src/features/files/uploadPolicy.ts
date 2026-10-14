import type { QueryClient } from '@tanstack/react-query';
import { uploadPolicyOptions } from '../organization/useOrganization';
import { formatBytes } from '@/lib/formatBytes';

export async function checkUpload(queryClient: QueryClient, file: File): Promise<string | null> {
  let policy;
  try {
    policy = await queryClient.fetchQuery(uploadPolicyOptions);
  } catch {
    return null;
  }

  if (file.size > policy.maxFileBytes) {
    return `"${file.name}" is ${formatBytes(file.size)}, which is over the ${formatBytes(policy.maxFileBytes)} per-file limit.`;
  }

  const dot = file.name.lastIndexOf('.');
  const extension = dot > 0 ? file.name.slice(dot).toLowerCase() : '';
  if (extension && policy.blockedExtensions.includes(extension)) {
    return `"${file.name}" can't be uploaded — ${extension} files aren't allowed.`;
  }
  return null;
}