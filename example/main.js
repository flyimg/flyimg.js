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

$('build').addEventListener('click', () => {
  const instance = $('instance').value.trim().replace(/\/$/, '');
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
});


