import { useRecentActivity } from '../activity/useActivity';
import type { ActivityLogResponse } from '../activity/activityApi';
import { FileText, Folder } from 'lucide-react';

const actionLabels: Record<string, string> = {
  Created: 'Created',
  Uploaded: 'Uploaded',
  Renamed: 'Renamed',
  Moved: 'Moved',
  Deleted: 'Deleted',
  Restored: 'Restored',
  Starred: 'Starred',
  Unstarred: 'Unstarred',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function groupByDay(entries: ActivityLogResponse[]) {
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: { label: string; entries: ActivityLogResponse[] }[] = [
    { label: 'Today', entries: [] },
    { label: 'Yesterday', entries: [] },
    { label: 'This Week', entries: [] },
    { label: 'Older', entries: [] },
  ];

  for (const entry of entries) {
    const entryDay = startOfDay(new Date(entry.createdAt));
    if (entryDay.getTime() === today.getTime()) {
      groups[0].entries.push(entry);
    } else if (entryDay.getTime() === yesterday.getTime()) {
      groups[1].entries.push(entry);
    } else if (entryDay >= weekAgo) {
      groups[2].entries.push(entry);
    } else {
      groups[3].entries.push(entry);
    }
  }

  return groups.filter((g) => g.entries.length > 0);
}

export function RecentScreen() {
  const { data: activity, isLoading } = useRecentActivity(50);
  const groups = activity ? groupByDay(activity) : [];

  return (
    <div className="mx-auto max-w-3xl">
      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!isLoading && groups.length === 0 && (
        <p className="rounded-lg border px-4 py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
      )}
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</h2>
          <div className="rounded-lg border divide-y">
            {group.entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                {entry.resourceType === 'Folder' ? (
                  <Folder className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="flex-1 truncate text-sm">{entry.resourceName}</span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {actionLabels[entry.action] ?? entry.action}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}