import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_IMAGE,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  absoluteUrl,
  getCanonicalUrl,
  stripUndefined,
} from '../utils/seo';

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords = DEFAULT_KEYWORDS,
  author = SITE_NAME,
  robots = 'index, follow, max-image-preview:large',
  jsonLd = [],
}) => {
  const pageTitle = title || `Latest Breaking News | ${SITE_NAME}`;
  const canonicalUrl = getCanonicalUrl(canonicalPath);
  const imageUrl = absoluteUrl(image);
  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  const googleVerification = process.env.REACT_APP_GOOGLE_SITE_VERIFICATION;
  const bingVerification = process.env.REACT_APP_BING_SITE_VERIFICATION;

  return (
    <Helmet prioritizeSeoTags>
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="application-name" content={SITE_NAME} />
      <meta httpEquiv="content-language" content="en" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      {googleVerification && <meta name="google-site-verification" content={googleVerification} />}
      {bingVerification && <meta name="msvalidate.01" content={bingVerification} />}

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {schemas.filter(Boolean).map((schema, index) => (
        <script type="application/ld+json" key={`${schema['@type'] || 'schema'}-${index}`}>
          {JSON.stringify(stripUndefined(schema))}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
