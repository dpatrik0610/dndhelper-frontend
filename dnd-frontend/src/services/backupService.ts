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
  const disposition = res.headers.get("Content-Disposition") ?? "";

  let fileName = `${collectionName}.gz`;
  const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i);
  if (match?.[1]) {
    // Strip surrounding quotes from filename if present
    fileName = match[1].replace(/['"]/g, "");
  }

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
