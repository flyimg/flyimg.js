import { FlyimgClient } from './vendor/flyimg-client.js';

// Full mapping used by the library
const SHORT_TO_LONG = {
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

const client = new FlyimgClient({
  optionsSeparator: ',',
  shortToLongKey: SHORT_TO_LONG,
  defaultOptions: { output: 'auto' },
});

const $ = (id) => document.getElementById(id);

function normalizeInstance(raw) {
  let v = (raw || '').trim();
  if (!/^https?:\/\//i.test(v)) {
    v = 'http://' + v;
  }
  return v.replace(/\/$/, '');
}

$('build').addEventListener('click', () => {
  const instance = normalizeInstance($('instance').value);
  const source = $('source').value.trim();
  const width = Number($('width').value) || undefined;
  const height = Number($('height').value) || undefined;
  const quality = Number($('quality').value) || undefined;

  const options = {
    width,
    height,
    quality,
    output: $('output').value || undefined,
    filter: $('filter').value || undefined,
    unsharp: $('unsharp').value || undefined,
    sharpen: $('sharpen').value || undefined,
    blur: $('blur').value || undefined,
    crop: $('crop').value || undefined,
    background: $('background').value || undefined,
    gravity: $('gravity').value || undefined,
    rotate: Number($('rotate').value) || undefined,
    resize: $('resize').value || undefined,
    text: $('text').value || undefined,
    'text-color': $('text-color').value || undefined,
    'text-size': Number($('text-size').value) || undefined,
    'text-bg': $('text-bg').value || undefined,
    scale: Number($('scale').value) || undefined,
    'sampling-factor': $('sampling-factor').value || undefined,
    extent: $('extent').value || undefined,
    colorspace: $('colorspace').value || undefined,
    strip: $('strip').checked ? 1 : undefined,
    'auto-orient': $('auto-orient').checked ? 1 : undefined,
    refresh: $('refresh').checked || undefined,
    'smart-crop': $('smart-crop').checked || undefined,
    'preserve-aspect-ratio': $('preserve-aspect-ratio').checked ? 1 : 0,
    'preserve-natural-size': $('preserve-natural-size').checked ? 1 : 0,
    'webp-lossless': $('webp-lossless').checked ? 1 : 0,
    'webp-method': Number($('webp-method').value) || undefined,
    'gif-frame': Number($('gif-frame').value) || undefined,
    extract: $('extract').value || undefined,
    'pdf-page-number': Number($('pdf-page-number').value) || undefined,
    'extract-top-x': Number($('extract-top-x').value) || undefined,
    'extract-top-y': Number($('extract-top-y').value) || undefined,
    'extract-bottom-x': Number($('extract-bottom-x').value) || undefined,
    'extract-bottom-y': Number($('extract-bottom-y').value) || undefined,
    density: Number($('density').value) || undefined,
    time: $('time').value || undefined,
    monochrome: $('monochrome').checked || undefined,
    'face-blur': Number($('face-blur').value) || undefined,
    'face-crop': Number($('face-crop').value) || undefined,
    'face-crop-position': Number($('face-crop-position').value) || undefined,
  };

  const url = client.buildUrl({ baseUrl: instance, imagePath: source, options });
  $('out').value = url;
  $('preview').src = url;
  hideError();
});

function hideError() { const el = document.getElementById('error'); if (el) { el.style.display = 'none'; el.textContent = ''; } }
function showError(msg) { const el = document.getElementById('error'); if (el) { el.style.display = 'block'; el.textContent = msg; } }

async function gatherOptions() {
  return {
    width: Number($('width').value) || undefined,
    height: Number($('height').value) || undefined,
    quality: Number($('quality').value) || undefined,
    output: $('output').value || undefined,
    filter: $('filter').value || undefined,
    unsharp: $('unsharp').value || undefined,
    sharpen: $('sharpen').value || undefined,
    blur: $('blur').value || undefined,
    crop: $('crop').value || undefined,
    background: $('background').value || undefined,
    gravity: $('gravity').value || undefined,
    rotate: Number($('rotate').value) || undefined,
    resize: $('resize').value || undefined,
    text: $('text').value || undefined,
    'text-color': $('text-color').value || undefined,
    'text-size': Number($('text-size').value) || undefined,
    'text-bg': $('text-bg').value || undefined,
    scale: Number($('scale').value) || undefined,
    'sampling-factor': $('sampling-factor').value || undefined,
    extent: $('extent').value || undefined,
    colorspace: $('colorspace').value || undefined,
    strip: $('strip').checked ? 1 : undefined,
    'auto-orient': $('auto-orient').checked ? 1 : undefined,
    refresh: $('refresh').checked || undefined,
    'smart-crop': $('smart-crop').checked || undefined,
    'preserve-aspect-ratio': $('preserve-aspect-ratio').checked ? 1 : 0,
    'preserve-natural-size': $('preserve-natural-size').checked ? 1 : 0,
    'webp-lossless': $('webp-lossless').checked ? 1 : 0,
    'webp-method': Number($('webp-method').value) || undefined,
    'gif-frame': Number($('gif-frame').value) || undefined,
    extract: $('extract').value || undefined,
    'pdf-page-number': Number($('pdf-page-number').value) || undefined,
    'extract-top-x': Number($('extract-top-x').value) || undefined,
    'extract-top-y': Number($('extract-top-y').value) || undefined,
    'extract-bottom-x': Number($('extract-bottom-x').value) || undefined,
    'extract-bottom-y': Number($('extract-bottom-y').value) || undefined,
    density: Number($('density').value) || undefined,
    time: $('time').value || undefined,
    monochrome: $('monochrome').checked || undefined,
    'face-blur': Number($('face-blur').value) || undefined,
    'face-crop': Number($('face-crop').value) || undefined,
    'face-crop-position': Number($('face-crop-position').value) || undefined,
  };
}

function buildOptionsSegment(options, separator, shortToLong) {
  const longToShort = new Map(Object.entries(shortToLong).map(([s, l]) => [l, s]));
  const parts = [];
  for (const [longKey, value] of Object.entries(options)) {
    if (value === null || value === undefined) continue;
    const shortKey = longToShort.get(longKey);
    if (!shortKey) continue;
    const val = typeof value === 'string' ? encodeURIComponent(value) : String(value);
    parts.push(`${shortKey}_${val}`);
  }
  return parts.join(separator);
}

$('upload').addEventListener('click', async () => {
  hideError();
  const instance = normalizeInstance($('instance').value);
  const options = await gatherOptions();
  const optionsSeg = buildOptionsSegment(options, ',', SHORT_TO_LONG);
  const normalizedBase = instance.replace(/\/$/, '');
  const uploadOnly = /\/upload$/.test(normalizedBase) ? normalizedBase : normalizedBase + '/upload';
  const uploadWithOptions = optionsSeg ? `${uploadOnly}/${optionsSeg}` : uploadOnly;

  try {
    const fileEl = $('file-input');
    let file = fileEl.files && fileEl.files[0];

    if (!file) {
      const raw = $('json-input').value.trim();
      const kind = document.querySelector('input[name="jsonKind"]:checked').value;
      if (!raw) throw new Error('No input provided');
      if (kind === 'dataUri') {
        // Convert data URI to Blob
        try {
          const resp = await fetch(raw);
          const blob = await resp.blob();
          file = new File([blob], 'upload', { type: blob.type || 'application/octet-stream' });
        } catch {
          throw new Error('Invalid data URI');
        }
      } else {
        // Base64 (no data URI), try to guess MIME from header and create Blob
        try {
          const binary = atob(raw.replace(/^data:[^;]+;base64,/, ''));
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'application/octet-stream' });
          file = new File([blob], 'upload', { type: blob.type });
        } catch {
          throw new Error('Invalid base64 data');
        }
      }
    }

    if (!file) throw new Error('No file selected or generated');

    const form = new FormData();
    // Some servers expect 'file', others 'image'. Send both pointing to the same blob.
    form.append('file', file, file.name || 'upload');
    form.append('image', file, file.name || 'upload');
    const res = await fetch(uploadWithOptions, { method: 'POST', body: form });

    const ct = res.headers.get('content-type') || '';
    if (ct.startsWith('image/')) {
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      $('preview').src = objectUrl;
      $('out').value = uploadWithOptions;
      return;
    }

    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch {}
    if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
    if (!data.url) throw new Error('Upload response missing url');

    // Build transformed URL using returned source URL and current options
    // If server returns a URL, it may already be transformed; otherwise build it
    const maybeTransformed = data.url && /\/upload\//.test(data.url);
    const finalUrl = maybeTransformed ? data.url : client.buildUrl({ baseUrl: instance, imagePath: data.url, options });
    $('preview').src = finalUrl;
    $('out').value = finalUrl;
  } catch (err) {
    showError(err && err.message ? err.message : String(err));
  }
});

 


