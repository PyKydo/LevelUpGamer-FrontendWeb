declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_BLOG_ASSETS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
