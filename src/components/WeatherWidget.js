import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton, Stack } from '@mui/material';
import {
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  WaterDrop as RainIcon,
  AcUnit as SnowIcon,
  Air as WindIcon,
  Thermostat as ThermostatIcon,
  Opacity as HumidityIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import './WeatherWidget.css';

const WeatherWidget = ({ weather, location = 'Detecting city' }) => {
  if (!weather) {
    return (
      <Card className="weather-card" elevation={0}>
        <CardContent className="weather-content">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Skeleton variant="text" width="45%" />
            <Skeleton variant="circular" width={48} height={48} />
          </Stack>
          <Skeleton variant="rectangular" height={64} width="55%" sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </CardContent>
      </Card>
    );
  }

  const getWeatherDisplay = (code) => {
    if (code <= 3) return { icon: <SunnyIcon fontSize="large" />, colorClass: 'icon-sunny', label: 'Clear' };
    if (code <= 48) return { icon: <CloudIcon fontSize="large" />, colorClass: 'icon-cloudy', label: 'Cloudy' };
    if (code <= 67) return { icon: <RainIcon fontSize="large" />, colorClass: 'icon-rainy', label: 'Rain' };
    return { icon: <SnowIcon fontSize="large" />, colorClass: 'icon-snowy', label: 'Cold' };
  };

  const weatherCode = weather.current_weather?.weathercode || 0;
  const displayConfig = getWeatherDisplay(weatherCode);
  const current = weather.current || {};
  const locationLabel = weather.location?.label || location;
  const feelsLike = current.apparent_temperature;
  const humidity = current.relative_humidity_2m;
  const windSpeed = weather.current_weather?.windspeed ?? current.wind_speed_10m;
  const maxTemp = weather.daily?.temperature_2m_max?.[0];
  const minTemp = weather.daily?.temperature_2m_min?.[0];
  const detailItems = [
    {
      icon: <WindIcon fontSize="small" />,
      label: `${Number.isFinite(windSpeed) ? windSpeed : '--'} km/h wind`,
    },
    Number.isFinite(feelsLike)
      ? {
          icon: <ThermostatIcon fontSize="small" />,
          label: `Feels ${feelsLike} C`,
        }
      : Number.isFinite(maxTemp) && Number.isFinite(minTemp)
        ? {
            icon: <ThermostatIcon fontSize="small" />,
            label: `${minTemp} C - ${maxTemp} C today`,
          }
        : null,
    Number.isFinite(humidity)
      ? {
          icon: <HumidityIcon fontSize="small" />,
          label: `${humidity}% humidity`,
        }
      : null,
  ].filter(Boolean);

  return (
    <Card className={`weather-card ${displayConfig.colorClass}`} elevation={0}>
      <CardContent className="weather-content">
        <Box className="weather-header">
          <Box minWidth={0}>
            <Typography variant="caption" className="weather-eyebrow">
              Local Weather
            </Typography>
            <Typography variant="h6" className="weather-city">
              <LocationIcon fontSize="small" />
              <span>{locationLabel}</span>
            </Typography>
          </Box>
          <Box className="weather-icon-wrapper">
            {displayConfig.icon}
          </Box>
        </Box>

        <Box className="weather-main">
          <Typography variant="h2" component="div" className="weather-temp">
            {weather.current_weather?.temperature}&deg;C
          </Typography>
          <Typography variant="body2" className="weather-condition">
            {displayConfig.label}
          </Typography>
        </Box>

        <Box className="weather-details">
          {detailItems.map((item) => (
            <Box className="weather-stat" key={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
