export type ApplicationDraftMode = "create" | "edit";

export interface ApplicationDraft {
  motivation: string;
  experience: string;
  questions: string;
  savedAt?: string;
  mode?: ApplicationDraftMode;
  routeId?: string;
  clubId?: string;
  clubName?: string;
  category?: string;
}

export interface ApplicationDraftListItem extends ApplicationDraft {
  storageKey: string;
  mode: ApplicationDraftMode;
  routeId: string;
}

export const DRAFT_STORAGE_PREFIX = "dl-club-application-draft";

export function getApplicationDraftStorageKey(
  mode: ApplicationDraftMode | "view",
  routeId: string | undefined,
): string | null {
  if (!routeId) return null;
  if (mode === "create") return `${DRAFT_STORAGE_PREFIX}:club:${routeId}`;
  if (mode === "edit") return `${DRAFT_STORAGE_PREFIX}:app:${routeId}`;
  return null;
}

export function readApplicationDraft(key: string): ApplicationDraft | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const value = data as Record<string, unknown>;

    return {
      motivation: typeof value.motivation === "string" ? value.motivation : "",
      experience: typeof value.experience === "string" ? value.experience : "",
      questions: typeof value.questions === "string" ? value.questions : "",
      savedAt: typeof value.savedAt === "string" ? value.savedAt : undefined,
      mode: value.mode === "create" || value.mode === "edit" ? value.mode : undefined,
      routeId: typeof value.routeId === "string" ? value.routeId : undefined,
      clubId: typeof value.clubId === "string" ? value.clubId : undefined,
      clubName: typeof value.clubName === "string" ? value.clubName : undefined,
      category: typeof value.category === "string" ? value.category : undefined,
    };
  } catch {
    return null;
  }
}

export function getApplicationDrafts(): ApplicationDraftListItem[] {
  const drafts: ApplicationDraftListItem[] = [];

  for (let index = 0; index < localStorage.length; index += 1) {
    const storageKey = localStorage.key(index);
    if (!storageKey?.startsWith(DRAFT_STORAGE_PREFIX)) continue;

    const draft = readApplicationDraft(storageKey);
    if (!draft) continue;

    const [, , keyType, keyRouteId] = storageKey.split(":");
    const mode = keyType === "app" ? "edit" : "create";
    const routeId = draft.routeId || keyRouteId;
    if (!routeId) continue;

    drafts.push({
      ...draft,
      storageKey,
      mode,
      routeId,
    });
  }

  return drafts.sort((a, b) => {
    const aTime = a.savedAt ? new Date(a.savedAt).getTime() : 0;
    const bTime = b.savedAt ? new Date(b.savedAt).getTime() : 0;
    return bTime - aTime;
  });
}

export function removeApplicationDraft(storageKey: string): void {
  localStorage.removeItem(storageKey);
}
