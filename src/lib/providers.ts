export type ApiFormat = 'openai' | 'anthropic';

export interface CredentialField {
  key: string;
  label: string;
  type: 'password' | 'text';
  required: boolean;
  defaultValue?: string;
  placeholder?: string;
}

export interface ModelOption {
  id: string;
  name: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  apiFormat: ApiFormat;
  defaultBaseUrl?: string;
  platformUrl?: string;
  credentials: CredentialField[];
  models: ModelOption[];
  supportsCustomModel: boolean;
}

export interface ProviderInstance {
  providerId: string;
  credentials: Record<string, string>;
  model: string;
}

export interface AppSettings {
  providers: Record<string, ProviderInstance>;
  activeProviderId: string;
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    icon: 'Sparkles',
    description: 'openaiDesc',
    apiFormat: 'openai',
    defaultBaseUrl: 'https://api.openai.com/v1',
    platformUrl: 'https://platform.openai.com/api-keys',
    credentials: [
      { key: 'apiKey', label: 'apiKey', type: 'password', required: true, placeholder: 'sk-...' },
    ],
    models: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano' },
      { id: 'o3-mini', name: 'o3-mini' },
      { id: 'o4-mini', name: 'o4-mini' },
    ],
    supportsCustomModel: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    icon: 'Brain',
    description: 'anthropicDesc',
    apiFormat: 'anthropic',
    defaultBaseUrl: 'https://api.anthropic.com',
    platformUrl: 'https://console.anthropic.com/settings/keys',
    credentials: [
      { key: 'apiKey', label: 'apiKey', type: 'password', required: true, placeholder: 'sk-ant-...' },
    ],
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-20250514', name: 'Claude Haiku 4' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku' },
    ],
    supportsCustomModel: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: 'Gem',
    description: 'geminiDesc',
    apiFormat: 'openai',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    platformUrl: 'https://aistudio.google.com/apikey',
    credentials: [
      { key: 'apiKey', label: 'apiKey', type: 'password', required: true, placeholder: 'AIza...' },
    ],
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    ],
    supportsCustomModel: true,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: 'Waves',
    description: 'deepseekDesc',
    apiFormat: 'openai',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    platformUrl: 'https://platform.deepseek.com/api_keys',
    credentials: [
      { key: 'apiKey', label: 'apiKey', type: 'password', required: true, placeholder: 'sk-...' },
    ],
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner' },
      { id: 'deepseek-v4-flash', name: 'deepseek-v4-flash' },
      { id: 'deepseek-v4-pro', name: 'deepseek-v4-pro' },
    ],
    supportsCustomModel: true,
  },
  {
    id: 'glm',
    name: 'GLM',
    icon: 'Zap',
    description: 'glmDesc',
    apiFormat: 'openai',
    defaultBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    platformUrl: 'https://open.bigmodel.cn/apikey/platform',
    credentials: [
      { key: 'apiKey', label: 'apiKey', type: 'password', required: true, placeholder: 'your-api-key...' },
    ],
    models: [
      { id: 'glm-5.1', name: 'GLM-5.1' },
      { id: 'glm-4.7', name: 'GLM-4.7' },
      { id: 'GLM-4.7-FlashX', name: 'GLM-4.7-FlashX' },
    ],
    supportsCustomModel: true,
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: 'Server',
    description: 'customDesc',
    apiFormat: 'openai',
    credentials: [
      { key: 'baseUrl', label: 'baseUrl', type: 'text', required: true, placeholder: 'https://your-api.com/v1' },
      { key: 'apiKey', label: 'apiKey', type: 'password', required: true, placeholder: 'sk-...' },
    ],
    models: [],
    supportsCustomModel: true,
  },
];

export function getProviderById(id: string): ProviderConfig | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export function getDefaultCredentials(provider: ProviderConfig): Record<string, string> {
  const creds: Record<string, string> = {};
  for (const field of provider.credentials) {
    creds[field.key] = field.defaultValue || '';
  }
  return creds;
}

export const DEFAULT_SETTINGS: AppSettings = {
  providers: {
    openai: { providerId: 'openai', credentials: { apiKey: '' }, model: 'gpt-4o' },
  },
  activeProviderId: 'openai',
};

export function getEffectiveBaseUrl(provider: ProviderConfig, credentials: Record<string, string>): string {
  return credentials.baseUrl || provider.defaultBaseUrl || '';
}

export function getActiveProvider(settings: AppSettings): ProviderInstance {
  return settings.providers[settings.activeProviderId] || DEFAULT_SETTINGS.providers.openai;
}

export function getOrCreateProvider(settings: AppSettings, providerId: string): ProviderInstance {
  if (settings.providers[providerId]) return settings.providers[providerId];
  const config = getProviderById(providerId);
  if (!config) return { providerId, credentials: {}, model: '' };
  return {
    providerId,
    credentials: getDefaultCredentials(config),
    model: config.models[0]?.id || '',
  };
}
