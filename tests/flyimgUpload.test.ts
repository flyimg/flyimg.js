import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import { flyimgUpload } from '../src/flyimg';

const INSTANCE = 'https://fly.example.com';

function makeReadableStreamFromBuffer(buffer: Buffer): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(buffer));
      controller.close();
    },
  });
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('flyimgUpload', () => {
  it('posts raw binary and streams image response to temp file', async () => {
    const responseBuffer = Buffer.from('image-binary');
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      body: makeReadableStreamFromBuffer(responseBuffer),
      headers: new Headers({ 'content-type': 'image/png', 'content-length': String(responseBuffer.length) }),
      status: 200,
      statusText: 'OK',
      text: async () => '',
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const input = Buffer.from('input-binary');
    const { outputImagePath, cleanup } = await flyimgUpload({
      instanceUrl: INSTANCE,
      input,
      contentType: 'image/png',
      options: { width: 100, height: 100 },
    });

    expect(fs.existsSync(outputImagePath)).toBe(true);
    const data = await fs.promises.readFile(outputImagePath);
    expect(data.equals(responseBuffer)).toBe(true);
    await cleanup();
    expect(fs.existsSync(outputImagePath)).toBe(false);
  });

  it('posts base64 JSON and follows JSON url to download', async () => {
    const outputBuffer = Buffer.from('processed');
    const fetchMock = vi
      .fn()
      // First response: JSON { url }
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify({ url: 'https://cdn.example.com/file.png' }),
      } as unknown as Response)
      // Second response: GET the URL → stream image
      .mockResolvedValueOnce({
        ok: true,
        body: makeReadableStreamFromBuffer(outputBuffer),
        headers: new Headers({ 'content-length': String(outputBuffer.length) }),
        status: 200,
        statusText: 'OK',
        text: async () => '',
      } as unknown as Response);

    vi.stubGlobal('fetch', fetchMock);

    const base64 = Buffer.from('in').toString('base64');
    const { outputImagePath, cleanup } = await flyimgUpload({
      instanceUrl: INSTANCE,
      input: { base64 },
      options: { output: 'webp' },
    });

    const data = await fs.promises.readFile(outputImagePath);
    expect(data.equals(outputBuffer)).toBe(true);
    await cleanup();
  });

  it('posts dataUri JSON successfully', async () => {
    const outputBuffer = Buffer.from('x');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        status: 200,
        statusText: 'OK',
        text: async () => JSON.stringify({ url: 'https://cdn.example.com/x.jpg' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        body: makeReadableStreamFromBuffer(outputBuffer),
        headers: new Headers({ 'content-length': String(outputBuffer.length) }),
        status: 200,
        statusText: 'OK',
        text: async () => '',
      } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const dataUri = 'data:image/png;base64,' + Buffer.from('abc').toString('base64');
    const { outputImagePath, cleanup } = await flyimgUpload({
      instanceUrl: INSTANCE,
      input: { dataUri },
      options: { quality: 70 },
    });
    const data = await fs.promises.readFile(outputImagePath);
    expect(data.equals(outputBuffer)).toBe(true);
    await cleanup();
  });

  it('throws on server error response', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      headers: new Headers({ 'content-type': 'application/json' }),
      status: 400,
      statusText: 'Bad Request',
      text: async () => 'invalid image',
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      flyimgUpload({ instanceUrl: INSTANCE, input: { base64: 'xxxx' } })
    ).rejects.toThrow(/Upload failed: 400 Bad Request/i);
  });

  it('throws when JSON response missing url', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      status: 200,
      statusText: 'OK',
      text: async () => JSON.stringify({}),
    } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      flyimgUpload({ instanceUrl: INSTANCE, input: { base64: 'aaaa' } })
    ).rejects.toThrow(/missing url/i);
  });

  it('throws on unsupported input type', async () => {
    await expect(
      flyimgUpload({ instanceUrl: INSTANCE, input: 123 as any })
    ).rejects.toThrow(/Unsupported upload input/);
  });
});


