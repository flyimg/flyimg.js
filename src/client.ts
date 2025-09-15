import { BuildUrlParams, FlyimgOptions, NormalizedConfig } from './types';

function isNullish(value: unknown): boolean {
  return value === null || value === undefined;
}

function encodeIfNeeded(value: unknown): string {
  if (typeof value === 'string') {
    return encodeURIComponent(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return encodeURIComponent(JSON.stringify(value));
}

export class FlyimgClient {
  private readonly config: NormalizedConfig;

  constructor(config: NormalizedConfig) {
    this.config = config;
  }

  buildOptionsSegment(options?: FlyimgOptions): string {
    const { optionsSeparator, shortToLongKey, defaultOptions } = this.config;
    const effective: Record<string, unknown> = { ...defaultOptions, ...(options || {}) };

    const parts: string[] = [];
    const longToShort = new Map<string, string>();
    for (const [shortKey, longKey] of Object.entries(shortToLongKey)) {
      longToShort.set(longKey, shortKey);
    }

    for (const [longKey, value] of Object.entries(effective)) {
      if (isNullish(value)) continue;
      const shortKey = longToShort.get(longKey);
      if (!shortKey) continue; // skip keys that aren't mapped
      parts.push(`${shortKey}_${encodeIfNeeded(value)}`);
    }

    return parts.join(optionsSeparator);
  }

  buildUrl(params: BuildUrlParams): string {
    const { baseUrl, imagePath, options, sign } = params;
    const optionsSegment = this.buildOptionsSegment(options);

    // Construct path expected by Flyimg: /<options>/<source>
    const pathWithoutHost = `/${optionsSegment}/${encodeURI(imagePath)}`;

    // Ensure '/upload' prefix exists once on the base URL
    const normalizedBase = baseUrl.replace(/\/$/, '');
    const baseWithUpload = /\/upload$/.test(normalizedBase)
      ? normalizedBase
      : normalizedBase + '/upload';

    let finalUrl = baseWithUpload + pathWithoutHost;
    if (sign) {
      const signature = sign(pathWithoutHost);
      if (signature) {
        const url = new URL(finalUrl);
        url.searchParams.set('s', signature);
        finalUrl = url.toString();
      }
    }
    return finalUrl;
  }
}


