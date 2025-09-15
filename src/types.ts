export type OptionsKeysMap = Record<string, string>;

export interface FlyimgYamlConfig {
  options_separator?: string;
  options_keys?: OptionsKeysMap;
  default_options?: Record<string, unknown>;
}

export interface NormalizedConfig {
  optionsSeparator: string;
  shortToLongKey: OptionsKeysMap;
  defaultOptions: Record<string, unknown>;
}

export type FlyimgOptions = Record<string, unknown>;

export interface BuildUrlParams {
  baseUrl: string;
  imagePath: string;
  options?: FlyimgOptions;
  sign?: (pathWithoutHost: string) => string | undefined;
}


