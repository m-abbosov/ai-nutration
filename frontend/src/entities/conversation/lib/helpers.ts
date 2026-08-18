import type { ConversationDto } from "@nutriai/shared/api/types";
import type { Dict } from "@nutriai/shared/i18n/types";
import { type DateBucket, bucketForDate } from "@nutriai/shared/lib/format";

export const BUCKET_ORDER: DateBucket[] = ["today", "yesterday", "previous7", "older"];

export function bucketLabel(bucket: DateBucket, t: Dict): string {
  switch (bucket) {
    case "today":
      return t.histToday;
    case "yesterday":
      return t.histYest;
    case "previous7":
      return t.histPrev7;
    case "older":
      return t.histOlder;
  }
}

export function groupConversations(conversations: ConversationDto[], now: Date = new Date()): { bucket: DateBucket; items: ConversationDto[] }[] {
  const buckets = new Map<DateBucket, ConversationDto[]>();
  for (const c of conversations) {
    const b = bucketForDate(c.updatedAt, now);
    if (!buckets.has(b)) buckets.set(b, []);
    buckets.get(b)!.push(c);
  }
  return BUCKET_ORDER.filter((b) => buckets.has(b)).map((bucket) => ({ bucket, items: buckets.get(bucket)! }));
}
