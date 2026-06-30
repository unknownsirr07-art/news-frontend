import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || typeof window === 'undefined') return;

    window.gtag?.('config', GA_ID, {
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location]);

  return null;
};

export default Analytics;
