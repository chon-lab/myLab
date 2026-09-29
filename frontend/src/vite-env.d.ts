interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_AUTH_MODE?: 'mock'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
