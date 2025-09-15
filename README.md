# @flyimg/flyimg.js

Interact with a Flyimg endpoint from Node.js: build option strings using `options_keys` and download the transformed image with progress callbacks.

## Install

```bash
npm i @flyimg/flyimg.js
```

## Usage

```ts
import { flyimg } from '@flyimg/flyimg.js';

// log upload and download progress
const onDownloadProgress = console.log;
const onUploadProgress = console.log;

flyimg({
  instanceUrl: process.env.INSTANCE_URL!,
  inputImage: './input.png', // local path OR http(s) URL
  onDownloadProgress,
  onUploadProgress,
  options: {
    quality: 80,
    output: 'png',
  },
}).then(({ outputImagePath, cleanup }) => {
  console.log(`image transformed and saved under path=${outputImagePath}`);
  // await cleanup();
});
```

- Only `options_keys` are used client-side. Server-controlled defaults or separators are ignored.
- For local files, the client POSTs to `${instanceUrl}/upload` and expects `{ url }`.
- The transformed image is streamed to a temp file. Call `cleanup()` to remove it.


## API

- `flyimg({ instanceUrl, inputImage, options?, onDownloadProgress?, onUploadProgress?, optionsKeys? })`
  - Returns: `{ outputImagePath, cleanup }`
  - `optionsKeys` defaults to the documented mapping embedded in the library.

## Options reference

See the upstream Flyimg documentation for full details and semantics: [`url-options.md`](https://github.com/flyimg/flyimg/blob/main/docs/url-options.md).

Below are the long option names accepted by this package (mapped to their short keys on the wire). Pass them under `options` when calling `flyimg`.

| Long name | Short key | Description |
| --- | --- | --- |
| `quality` | `q` | Output quality (integer, e.g. 80). |
| `output` | `o` | Output format, e.g. `jpg`, `png`, `webp`, `avif`, or `auto`. |
| `unsharp` | `unsh` | Apply unsharp mask (e.g. radius×sigma+amount). |
| `sharpen` | `sh` | Sharpen amount/preset. |
| `blur` | `blr` | Gaussian blur radius/sigma. |
| `face-crop` | `fc` | Enable face crop (boolean or mode). |
| `face-crop-position` | `fcp` | Face crop position or index. |
| `face-blur` | `fb` | Blur detected faces (intensity). |
| `width` | `w` | Target width in pixels. |
| `height` | `h` | Target height in pixels. |
| `crop` | `c` | Crop geometry or mode (e.g. `WxH+X+Y` or keywords). |
| `background` | `bg` | Background color (e.g. `white`, `#RRGGBB`). |
| `strip` | `st` | Strip metadata (1 to strip, 0 to keep). |
| `auto-orient` | `ao` | Auto rotate based on EXIF (0/1). |
| `resize` | `rz` | Resize mode (fit, fill, etc.). |
| `gravity` | `g` | Gravity for crop/extent (e.g. `Center`, `NorthWest`). |
| `filter` | `f` | Resampling filter (e.g. `Lanczos`). |
| `rotate` | `r` | Rotate degrees (e.g. 90). |
| `text` | `t` | Overlay text string. |
| `text-color` | `tc` | Text color (e.g. `white`, `#RRGGBB`). |
| `text-size` | `ts` | Text font size. |
| `text-bg` | `tbg` | Text background color. |
| `scale` | `sc` | Scale factor (e.g. 2 for 2x). |
| `sampling-factor` | `sf` | Chroma subsampling (e.g. `1x1`, `2x2`). |
| `refresh` | `rf` | Force refresh/bypass cache (boolean). |
| `smart-crop` | `smc` | Enable smart cropping (boolean). |
| `extent` | `ett` | Extent canvas size (e.g. `WxH`). |
| `preserve-aspect-ratio` | `par` | Keep aspect ratio (0/1). |
| `preserve-natural-size` | `pns` | Avoid upscaling beyond natural size (0/1). |
| `webp-lossless` | `webpl` | WebP lossless mode (0/1). |
| `webp-method` | `webpm` | WebP encoding method (0–6). |
| `gif-frame` | `gf` | Extract specific GIF frame (index). |
| `extract` | `e` | Extract region (geometry). |
| `extract-top-x` | `p1x` | Extract top-left X. |
| `extract-top-y` | `p1y` | Extract top-left Y. |
| `extract-bottom-x` | `p2x` | Extract bottom-right X. |
| `extract-bottom-y` | `p2y` | Extract bottom-right Y. |
| `pdf-page-number` | `pdfp` | PDF page to render (1-based). |
| `density` | `dnst` | DPI/density for vector/PDF rasterization. |
| `time` | `tm` | Video time offset (e.g. `00:00:01`). |
| `colorspace` | `clsp` | Colorspace (e.g. `sRGB`). |
| `monochrome` | `mnchr` | Convert to monochrome (boolean or params). |

### Examples

- Resize and format:
```ts
await flyimg({
  instanceUrl,
  inputImage: 'https://example.com/a.jpg',
  options: { width: 800, height: 600, output: 'webp', quality: 82 },
});
```

- Smart crop to square and set background:
```ts
await flyimg({
  instanceUrl,
  inputImage: './local.png',
  options: { smart-crop: true, extent: '512x512', background: '#000000' },
});
```

- Overlay text:
```ts
await flyimg({
  instanceUrl,
  inputImage: 'https://example.com/hero.jpg',
  options: { text: 'Hello', 'text-color': 'white', 'text-size': 32 },
});
```

### Test Example folder

```
npx http-server example -c-1 -p 5174
```

