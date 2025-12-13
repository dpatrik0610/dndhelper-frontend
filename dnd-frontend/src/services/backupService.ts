const baseUrl = "/Backup";

interface BackupFile {
  fileName: string;
  contentType: string;
  blob: Blob;
}

interface RestoreResponse {
  message: string;
}

function getApiBase() {
  return import.meta.env.VITE_API_BASE;
}

function buildAuthHeaders(token?: string): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function parseFileName(disposition: string | null, fallback: string) {
  if (!disposition) return fallback;
  const match = disposition.match(/filename\*?=([^;]+)/i);
  if (match?.[1]) {
    const raw = match[1].trim();
    if (raw.startsWith("UTF-8''")) {
      try {
        return decodeURIComponent(raw.replace(/^UTF-8''/, ""));
      } catch {
        return fallback;
      }
    }
    return raw.replace(/['"]/g, "");
  }
  return fallback;
}

async function handleError(res: Response): Promise<never> {
  let message = res.statusText;
  try {
    const body = await res.json();
    message = body?.message ?? message;
  } catch {
    // ignore parse failures and fall back to status text
  }
  throw new Error(message || "Request failed");
}

export async function exportCollection(collectionName: string, token: string): Promise<BackupFile> {
  const res = await fetch(`${getApiBase()}${baseUrl}/${encodeURIComponent(collectionName)}`, {
    method: "GET",
    headers: buildAuthHeaders(token),
  });

  if (!res.ok) await handleError(res);

  const contentType = res.headers.get("Content-Type") ?? "application/octet-stream";
  const disposition = res.headers.get("Content-Disposition");
  const fileName = parseFileName(disposition, `${collectionName}.gz`);

  const blob = await res.blob();
  return { blob, fileName, contentType };
}

export async function exportAllCollections(token: string): Promise<BackupFile> {
  const res = await fetch(`${getApiBase()}${baseUrl}/all`, {
    method: "GET",
    headers: buildAuthHeaders(token),
  });

  if (!res.ok) await handleError(res);

  const contentType = res.headers.get("Content-Type") ?? "application/zip";
  const disposition = res.headers.get("Content-Disposition");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const envTag = import.meta.env.PROD ? "prod" : "dev";
  const fallback = `backup-${envTag}-${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}.zip`;
  const fileName = parseFileName(disposition, fallback);

  const blob = await res.blob();
  return { blob, fileName, contentType };
}

export async function restoreCollection(collectionName: string, file: File, token: string): Promise<RestoreResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${getApiBase()}${baseUrl}/${encodeURIComponent(collectionName)}/restore`, {
    method: "POST",
    headers: buildAuthHeaders(token),
    body: formData,
  });

  if (!res.ok) await handleError(res);

  const raw = await res.text();
  const parsed = (() => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const message =
    (parsed as any)?.message ||
    (raw && raw.trim()) ||
    res.statusText ||
    `Collection '${collectionName}' restored.`;

  return { message };
}
