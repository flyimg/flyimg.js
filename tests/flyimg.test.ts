import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { flyimg } from '../src/flyimg';

declare global {
  // eslint-disable-next-line no-var
  var fetch: typeof fetch;
}

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

describe('flyimg', () => {
  it('downloads transformed image from remote URL', async () => {
    // mock fetch for the transformation GET
    const imgBuffer = Buffer.from('hello');
    const fetchMock = vi.fn()
      // First call (GET transformed)
      .mockResolvedValueOnce({
        ok: true,
        body: makeReadableStreamFromBuffer(imgBuffer),
        headers: new Headers({ 'content-length': String(imgBuffer.length) }),
        status: 200,
        statusText: 'OK',
        text: async () => '',
      } as unknown as Response);

    vi.stubGlobal('fetch', fetchMock);

    const { outputImagePath, cleanup } = await flyimg({
      instanceUrl: INSTANCE,
      inputImage: 'https://example.com/pic.jpg',
      options: { quality: 80 },
    });

    const exists = fs.existsSync(outputImagePath);
    expect(exists).toBe(true);
    const content = await fs.promises.readFile(outputImagePath);
    expect(content.equals(imgBuffer)).toBe(true);
    await cleanup();
    expect(fs.existsSync(outputImagePath)).toBe(false);
  });

  it('uploads local file then downloads result', async () => {
    // create a small temp file as input
    const tmp = path.join(os.tmpdir(), `flyimg-test-${Date.now()}.txt`);
    await fs.promises.writeFile(tmp, 'data');

    const uploadResponse = { url: 'https://cdn.example.com/uploaded/a.png' };
    const outputBuffer = Buffer.from('result');

    const fetchMock = vi.fn()
      // First call: POST /upload
      .mockResolvedValueOnce({
        ok: true,
        json: async () => uploadResponse,
        status: 200,
        statusText: 'OK',
        text: async () => '',
      } as unknown as Response)
      // Second call: GET transformed
      .mockResolvedValueOnce({
        ok: true,
        body: makeReadableStreamFromBuffer(outputBuffer),
        headers: new Headers({ 'content-length': String(outputBuffer.length) }),
        status: 200,
        statusText: 'OK',
        text: async () => '',
      } as unknown as Response);

    vi.stubGlobal('fetch', fetchMock);

    const { outputImagePath, cleanup } = await flyimg({
      instanceUrl: INSTANCE,
      inputImage: tmp,
      options: { output: 'png' },
    });

    const data = await fs.promises.readFile(outputImagePath);
    expect(data.equals(outputBuffer)).toBe(true);
    await cleanup();
    await fs.promises.rm(tmp, { force: true });
  });
});


