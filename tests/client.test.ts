import { describe, it, expect } from 'vitest';
import { FlyimgClient } from '../src/client';

const mapping = {
  q: 'quality',
  w: 'width',
  h: 'height',
  o: 'output',
};

describe('FlyimgClient', () => {
  const client = new FlyimgClient({
    optionsSeparator: ',',
    shortToLongKey: mapping,
    defaultOptions: { output: 'auto' },
  });

  it('builds options segment using mapping and defaults', () => {
    const seg = client.buildOptionsSegment({ width: 200, height: 100, quality: 80 });
    expect(seg).toContain('w_200');
    expect(seg).toContain('h_100');
    expect(seg).toContain('q_80');
    // default present
    expect(seg).toContain('o_auto');
  });

  it('builds full url', () => {
    const url = client.buildUrl({
      baseUrl: 'https://img.example.com',
      imagePath: 'https://example.com/a.jpg',
      options: { quality: 70 },
    });
    expect(url.startsWith('https://img.example.com/upload/')).toBe(true);
    expect(url).toContain('q_70');
    expect(url).toContain(',');
  });
});


