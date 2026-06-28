import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Stack } from '@mui/material';
import './MarketWidget.css';

const formatInr = (value, options = {}) => {
  if (!Number.isFinite(value)) return 'Unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
};

const formatTrend = (asset) => {
  const change = asset?.change;
  if (!change || change.direction === 'unknown') {
    return { label: 'Trend pending', className: 'market-change-muted' };
  }

  const sign = change.direction === 'up' ? '+' : '';
  const label = Number.isFinite(change.percent)
    ? `${sign}${change.percent.toFixed(2)}%`
    : `${sign}${formatInr(change.amount)}`;
  const suffix = change.basis === 'since_last_fetch' ? ' since refresh' : '';

  return {
    label: `${label}${suffix}`,
    className: change.direction === 'down' ? 'market-change-down' : 'market-change-up',
  };
};

const MarketWidget = ({ marketData }) => {
  const [selectedAsset, setSelectedAsset] = useState('gold');

  if (!marketData) {
    return (
      <Card className="market-widget-card" elevation={0}>
        <CardContent className="market-widget-content">
          <Typography variant="h6" className="widget-title">Market Overview</Typography>
          <Stack spacing={2} mb={3}>
            <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 1 }} />
          </Stack>
          <Skeleton variant="rectangular" height={128} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  const assets = {
    gold: {
      key: 'gold',
      label: 'Gold',
      price: Number(marketData.gold?.price),
      unit: marketData.gold?.unit || '10g',
      description: marketData.gold?.description || 'International 24K spot estimate per 10 grams',
      basis: marketData.gold?.basis,
      source: Number(marketData.gold?.source_price_usd_per_ounce),
      sourceUnit: marketData.gold?.source_unit || 'troy ounce',
      data: marketData.gold,
    },
    silver: {
      key: 'silver',
      label: 'Silver',
      price: Number(marketData.silver?.price),
      unit: marketData.silver?.unit || '1g',
      description: marketData.silver?.description || 'International silver spot estimate per gram',
      basis: marketData.silver?.basis,
      source: Number(marketData.silver?.source_price_usd_per_ounce),
      sourceUnit: marketData.silver?.source_unit || 'troy ounce',
      data: marketData.silver,
    },
    usd: {
      key: 'usd',
      label: 'USD/INR',
      price: Number(marketData.usd_inr?.price ?? marketData.currency?.rates?.INR),
      unit: marketData.usd_inr?.unit || '1 USD',
      description: marketData.usd_inr?.description || 'Indian rupees per 1 US dollar',
      basis: marketData.usd_inr?.basis,
      source: null,
      sourceUnit: null,
      data: marketData.usd_inr,
    },
  };

  const activeAsset = assets[selectedAsset];
  const activeTrend = formatTrend(activeAsset.data);
  const updatedAt = marketData.updated_at
    ? new Date(marketData.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <Card className="market-widget-card" elevation={0}>
      <CardContent className="market-widget-content">
        <Box className="market-widget-header">
          <Typography variant="h6" className="widget-title">
            Market Overview
          </Typography>
          <Typography variant="caption" className="market-updated">
            Updated {updatedAt}
          </Typography>
        </Box>

        <Box className="market-tabs" role="tablist" aria-label="Market asset selector">
          {Object.values(assets).map((asset) => (
            <button
              type="button"
              key={asset.key}
              className={`market-tab ${selectedAsset === asset.key ? 'active' : ''}`}
              onClick={() => setSelectedAsset(asset.key)}
            >
              {asset.label}
            </button>
          ))}
        </Box>

        <Box className="market-focus-panel">
          <Typography variant="caption" className="market-basis-badge">
            Spot converted estimate
          </Typography>
          <Typography variant="caption" className="market-focus-label">
            {activeAsset.description}
          </Typography>
          <Typography variant="h3" className="market-focus-price">
            {formatInr(activeAsset.price, activeAsset.key === 'usd' ? {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            } : {})}
          </Typography>
          <Box className="market-focus-meta">
            <Typography variant="body2">per {activeAsset.unit}</Typography>
            <Typography variant="body2" className={activeTrend.className}>
              {activeTrend.label}
            </Typography>
          </Box>
          {activeAsset.basis && (
            <Typography variant="caption" className="market-basis-note">
              {activeAsset.basis}
            </Typography>
          )}
        </Box>

      </CardContent>
    </Card>
  );
};

export default MarketWidget;
