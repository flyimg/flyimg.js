// src/client.ts
function isNullish(value) {
  return value === null || value === void 0;
}
function encodeIfNeeded(value) {
  if (typeof value === "string") {
    return encodeURIComponent(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return encodeURIComponent(JSON.stringify(value));
}
var FlyimgClient = class {
  constructor(config) {
    this.config = config;
  }
  buildOptionsSegment(options) {
    const { optionsSeparator, shortToLongKey, defaultOptions } = this.config;
    const effective = { ...defaultOptions, ...options || {} };
    const parts = [];
    const longToShort = /* @__PURE__ */ new Map();
    for (const [shortKey, longKey] of Object.entries(shortToLongKey)) {
      longToShort.set(longKey, shortKey);
    }
    for (const [longKey, value] of Object.entries(effective)) {
      if (isNullish(value)) continue;
      const shortKey = longToShort.get(longKey);
      if (!shortKey) continue;
      parts.push(`${shortKey}_${encodeIfNeeded(value)}`);
    }
    return parts.join(optionsSeparator);
  }
  buildUrl(params) {
    const { baseUrl, imagePath, options, sign } = params;
    const optionsSegment = this.buildOptionsSegment(options);
    const pathWithoutHost = `/${optionsSegment}/${encodeURI(imagePath)}`;
    const normalizedBase = baseUrl.replace(/\/$/, "");
    const baseWithUpload = /\/upload$/.test(normalizedBase) ? normalizedBase : normalizedBase + "/upload";
    let finalUrl = baseWithUpload + pathWithoutHost;
    if (sign) {
      const signature = sign(pathWithoutHost);
      if (signature) {
        const url = new URL(finalUrl);
        url.searchParams.set("s", signature);
        finalUrl = url.toString();
      }
    }
    return finalUrl;
  }
};
export {
  FlyimgClient
};
