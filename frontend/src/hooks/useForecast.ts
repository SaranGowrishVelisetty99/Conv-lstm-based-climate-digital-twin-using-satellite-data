'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  postRollingForecast,
  getLatestForecast,
  getLatestData,
  waitForBackend,
  type RollingForecastResponse,
  type ForecastDay,
} from '@/lib/api';

export function useForecast() {
  const [forecast, setForecast] = useState<RollingForecastResponse | null>(null);
  const [baseline, setBaseline] = useState<{
    rainfall: number[][];
    max_temp: number[][];
    min_temp: number[][];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  const fetchForecast = useCallback(async (days = 7) => {
    setLoading(true);
    setError(null);
    try {
      await waitForBackend();
      const [forecastRes, baselineRes] = await Promise.all([
        postRollingForecast(days),
        getLatestData(),
      ]);
      setForecast(forecastRes);
      setBaseline({
        rainfall: baselineRes.rainfall,
        max_temp: baselineRes.max_temp,
        min_temp: baselineRes.min_temp,
      });
      setActiveDay(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch forecast');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const currentDay: ForecastDay | null =
    forecast?.forecasts?.[activeDay] ?? null;

  return {
    forecast,
    baseline,
    loading,
    error,
    activeDay,
    setActiveDay,
    currentDay,
    refetch: fetchForecast,
  };
}
