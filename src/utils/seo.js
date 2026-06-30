export const SITE_NAME = 'Global Sankshipt';
export const SITE_URL = (process.env.REACT_APP_SITE_URL || 'https://globalsankshipt.in').replace(/\/$/, '');
export const DEFAULT_IMAGE = `${SITE_URL}/GS.png`;
export const DEFAULT_DESCRIPTION = 'Latest breaking news from India and around the world covering politics, business, technology, sports, entertainment and more.';
export const DEFAULT_KEYWORDS = [
  'Global Sankshipt',
  'breaking news',
  'latest news',
  'India news',
  'world news',
  'politics',
  'business',
  'technology',
  'sports',
  'entertainment',
];

export const toTitleCase = (value = '') => (
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
);

export const getCanonicalUrl = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
};

export const absoluteUrl = (url) => {
  if (!url) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export const truncateText = (value = '', maxLength = 160) => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
};

export const getArticleText = (article) => (
  article?.sections?.map((section) => section.content).filter(Boolean).join(' ') || ''
);

export const getArticleDescription = (article) => (
  truncateText(article?.deck || article?.summary || getArticleText(article) || DEFAULT_DESCRIPTION)
);

export const getArticleKeywords = (article) => (
  [...new Set([...(article?.tags || []), article?.category, SITE_NAME].filter(Boolean))]
);

export const getArticleImage = (article) => absoluteUrl(article?.image);

export const getReadingTime = (article) => {
  const words = `${article?.headline || ''} ${article?.deck || ''} ${article?.summary || ''} ${getArticleText(article)}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

export const stripUndefined = (value) => JSON.parse(JSON.stringify(value));
