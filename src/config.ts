import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { FlyimgYamlConfig, NormalizedConfig } from './types';

const DEFAULT_SEPARATOR = ',';

export function loadConfigFromYaml(filePath: string): NormalizedConfig {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Config file not found at ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf8');
  const doc = yaml.load(raw) as FlyimgYamlConfig | undefined;
  const optionsSeparator = doc?.options_separator ?? DEFAULT_SEPARATOR;
  const shortToLongKey = doc?.options_keys ?? {};
  const defaultOptions = doc?.default_options ?? {};

  return {
    optionsSeparator,
    shortToLongKey,
    defaultOptions,
  };
}

export function getProjectDefaultConfig(): NormalizedConfig {
  // Looks for flyimg-default-config.yml in project root by default
  return loadConfigFromYaml('flyimg-default-config.yml');
}


