import React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import './MarketTicker.css';

const formatInr = (value, options = {}) => {
  if (!Number.isFinite(value)) return 'Loading';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
};

const getTrend = (asset) => {
  const change = asset?.change;
  if (!change || change.direction === 'unknown') {
    return { className: 'trend-muted', label: 'Trend pending' };
  }

  const sign = change.direction === 'up' ? '+' : '';
  const value = Number.isFinite(change.percent)
    ? `${sign}${change.percent.toFixed(2)}%`
    : `${sign}${formatInr(change.amount)}`;

  const suffix = change.basis === 'since_last_fetch' ? ' refresh' : '';
  return {
    className: change.direction === 'down' ? 'trend-down' : 'trend-up',
    label: `${value}${suffix}`,
  };
};

const MarketTicker = ({ marketData, weatherData, weatherLocation }) => {
  const assets = [
    {
      key: 'gold',
      dot: 'dot-gold',
      label: 'Gold',
      value: formatInr(Number(marketData?.gold?.price)),
      unit: marketData?.gold?.unit || '10g',
      trend: getTrend(marketData?.gold),
    },
    {
      key: 'silver',
      dot: 'dot-silver',
      label: 'Silver',
      value: formatInr(Number(marketData?.silver?.price)),
      unit: marketData?.silver?.unit || '1g',
      trend: getTrend(marketData?.silver),
    },
    {
      key: 'usd',
      dot: 'dot-usd',
      label: 'USD/INR',
      value: formatInr(Number(marketData?.usd_inr?.price ?? marketData?.currency?.rates?.INR), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      unit: marketData?.usd_inr?.unit || '1 USD',
      trend: getTrend(marketData?.usd_inr),
    },
  ];
  const locationLabel = weatherLocation || weatherData?.location?.label;

  return (
    <Box className="ticker-wrapper">
      <Container maxWidth="xl" className="ticker-container">
        <Box className="ticker-content">
          <Stack direction="row" spacing={4} className="ticker-section">
            {assets.map((asset) => (
              <Box className="ticker-item" key={asset.key}>
                <span className={`status-dot ${asset.dot}`} />
                <Typography variant="body2" className="ticker-label">{asset.label}</Typography>
                <Typography variant="body2" className="ticker-value">{asset.value}</Typography>
                <Typography variant="caption" className="ticker-unit">/{asset.unit}</Typography>
                <Typography variant="caption" className={asset.trend.className}>{asset.trend.label}</Typography>
              </Box>
            ))}
          </Stack>

          {weatherData && (
            <Stack direction="row" spacing={1.5} alignItems="center" className="ticker-section weather-section">
              {locationLabel && (
                <>
                  <Typography variant="body2" className="ticker-label">
                    {locationLabel}
                  </Typography>
                  <span className="ticker-divider">|</span>
                </>
              )}
              <Typography variant="body2" className="ticker-label">
                {weatherData.current_weather?.temperature}&deg;C
              </Typography>
              <span className="ticker-divider">|</span>
              <Typography variant="body2" className="ticker-label">
                Wind: {weatherData.current_weather?.windspeed} km/h
              </Typography>
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default MarketTicker;
