import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { FlyimgOptions, OptionsKeysMap } from './types';

export interface FlyimgParams {
  instanceUrl: string;
  inputImage: string; // URL or local file path
  options?: FlyimgOptions;
  optionsKeys?: OptionsKeysMap; // override default mapping
  onDownloadProgress?: (info: { receivedBytes: number; totalBytes?: number }) => void;
  onUploadProgress?: (info: { sentBytes: number; totalBytes?: number }) => void;
}

export interface FlyimgResult {
  outputImagePath: string;
  cleanup: () => Promise<void>;
}

// Default mapping copied from the provided example YAML options_keys
const DEFAULT_OPTIONS_KEYS: OptionsKeysMap = {
  q: 'quality',
  o: 'output',
  unsh: 'unsharp',
  sh: 'sharpen',
  blr: 'blur',
  fc: 'face-crop',
  fcp: 'face-crop-position',
  fb: 'face-blur',
  w: 'width',
  h: 'height',
  c: 'crop',
  bg: 'background',
  st: 'strip',
  ao: 'auto-orient',
  rz: 'resize',
  g: 'gravity',
  f: 'filter',
  r: 'rotate',
  t: 'text',
  tc: 'text-color',
  ts: 'text-size',
  tbg: 'text-bg',
  sc: 'scale',
  sf: 'sampling-factor',
  rf: 'refresh',
  smc: 'smart-crop',
  ett: 'extent',
  par: 'preserve-aspect-ratio',
  pns: 'preserve-natural-size',
  webpl: 'webp-lossless',
  webpm: 'webp-method',
  gf: 'gif-frame',
  e: 'extract',
  p1x: 'extract-top-x',
  p1y: 'extract-top-y',
  p2x: 'extract-bottom-x',
  p2y: 'extract-bottom-y',
  pdfp: 'pdf-page-number',
  dnst: 'density',
  tm: 'time',
  clsp: 'colorspace',
  mnchr: 'monochrome',
};

function isUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildOptionsSegment(options: FlyimgOptions | undefined, keys: OptionsKeysMap): string {
  if (!options) return '';
  const longToShort = new Map<string, string>();
  for (const [shortKey, longKey] of Object.entries(keys)) longToShort.set(longKey, shortKey);
  const parts: string[] = [];
  for (const [longKey, value] of Object.entries(options)) {
    if (value === null || value === undefined) continue;
    const shortKey = longToShort.get(longKey);
    if (!shortKey) continue;
    const encoded = typeof value === 'string' ? encodeURIComponent(value) : String(value);
    parts.push(`${shortKey}_${encoded}`);
  }
  return parts.join(',');
}

async function uploadLocalFile(instanceUrl: string, filePath: string, onUploadProgress?: FlyimgParams['onUploadProgress']): Promise<string> {
  // Assumes the Flyimg instance exposes POST /upload returning { url: string }
  const stat = await fs.promises.stat(filePath);
  const totalBytes = stat.size;
  const fileStream = fs.createReadStream(filePath);

  // Read into memory to leverage Web FormData easily; for huge files, a streaming multipart would be preferable
  const chunks: Buffer[] = [];
  let sentBytes = 0;
  await new Promise<void>((resolve, reject) => {
    fileStream.on('data', (chunk) => {
      chunks.push(chunk as Buffer);
      sentBytes += (chunk as Buffer).length;
      onUploadProgress?.({ sentBytes, totalBytes });
    });
    fileStream.on('end', () => resolve());
    fileStream.on('error', reject);
  });

  const buffer = Buffer.concat(chunks);
  const filename = path.basename(filePath);
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const form = new FormData();
  form.append('file', blob, filename);

  const res = await fetch(instanceUrl.replace(/\/$/, '') + '/upload', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
  }
  const data = (await res.json().catch(() => ({}))) as { url?: string };
  if (!data.url) throw new Error('Upload response missing url');
  return data.url;
}

async function downloadToTempFile(fileUrl: string, onDownloadProgress?: FlyimgParams['onDownloadProgress']): Promise<string> {
  const res = await fetch(fileUrl);
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Download failed: ${res.status} ${res.statusText} ${text}`);
  }
  const totalBytes = Number(res.headers.get('content-length') || '') || undefined;
  const tmpDir = os.tmpdir();
  const extGuess = path.extname(new URL(fileUrl).pathname) || '.img';
  const tmpPath = path.join(tmpDir, `flyimg-${crypto.randomBytes(6).toString('hex')}${extGuess}`);
  const file = fs.createWriteStream(tmpPath);

  const reader = (res.body as unknown as ReadableStream<Uint8Array>).getReader();
  let receivedBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        file.write(value);
        receivedBytes += value.length;
        onDownloadProgress?.({ receivedBytes, totalBytes });
      }
    }
  } finally {
    // Ensure the write stream closes and flushes
    await new Promise<void>((resolve, reject) => {
      file.once('finish', resolve);
      file.once('error', reject);
      file.end();
    });
  }
  return tmpPath;
}

export async function flyimg(params: FlyimgParams): Promise<FlyimgResult> {
  const { instanceUrl, inputImage, options, optionsKeys, onDownloadProgress, onUploadProgress } = params;
  const mapping = optionsKeys ?? DEFAULT_OPTIONS_KEYS;

  let sourceUrl = inputImage;
  if (!isUrl(inputImage)) {
    // Treat as local file path → upload first
    sourceUrl = await uploadLocalFile(instanceUrl, inputImage, onUploadProgress);
  }

  const optionsSegment = buildOptionsSegment(options, mapping);
  const urlPath = `/${optionsSegment}/${encodeURI(sourceUrl)}`.replace('//', '/');
  const normalizedBase = instanceUrl.replace(/\/$/, '');
  const baseWithUpload = /\/upload$/.test(normalizedBase) ? normalizedBase : normalizedBase + '/upload';
  const finalUrl = baseWithUpload + urlPath;

  const outputImagePath = await downloadToTempFile(finalUrl, onDownloadProgress);
  const cleanup = async () => {
    await fs.promises.rm(outputImagePath, { force: true });
  };
  return { outputImagePath, cleanup };
}


