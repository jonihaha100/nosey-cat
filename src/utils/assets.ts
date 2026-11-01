/**
 * Helper to resolve public assets correctly whether running locally,
 * on GitHub Pages (/nosey-cat/), or on custom domains / Vercel (/).
 */
export const getAssetUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? `${base}${cleanPath}` : `${base}/${cleanPath}`;
};

