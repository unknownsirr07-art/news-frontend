const STORAGE_KEY = 'newshub.savedArticles';

export const getSavedArticles = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
};

export const isArticleSaved = (slug) => (
  getSavedArticles().some((article) => article.slug === slug)
);

export const saveArticle = (article) => {
  const savedArticles = getSavedArticles();
  const savedArticle = {
    article_id: article.article_id,
    slug: article.slug,
    headline: article.headline,
    deck: article.deck,
    summary: article.summary,
    source_title: article.source_title,
    generated_at: article.generated_at,
    tags: article.tags || [],
  };

  const nextArticles = [
    savedArticle,
    ...savedArticles.filter((item) => item.slug !== article.slug),
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextArticles));
  window.dispatchEvent(new Event('savedArticlesChanged'));
  return nextArticles;
};

export const removeSavedArticle = (slug) => {
  const nextArticles = getSavedArticles().filter((article) => article.slug !== slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextArticles));
  window.dispatchEvent(new Event('savedArticlesChanged'));
  return nextArticles;
};
