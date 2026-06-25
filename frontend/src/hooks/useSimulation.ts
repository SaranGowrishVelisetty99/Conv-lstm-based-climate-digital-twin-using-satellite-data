'use client';

import { useState, useCallback } from 'react';
import {
  runWhatIf,
  runScenario,
  listScenarios,
  type ScenarioInfo,
  type ScenarioRunResponse,
  type WhatIfRequest,
} from '@/lib/api';

export function useSimulation() {
  const [result, setResult] = useState<ScenarioRunResponse | null>(null);
  const [baseline, setBaseline] = useState<ScenarioRunResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScenarios = useCallback(async () => {
    try {
      const res = await listScenarios();
      setScenarios(res.scenarios);
    } catch {
      setScenarios([]);
    }
  }, []);

  const fetchBaseline = useCallback(async () => {
    try {
      const res = await runWhatIf({ temperature_delta: 0, rainfall_delta: 0 });
      setBaseline(res);
    } catch {
      setBaseline(null);
    }
  }, []);

  const runCustomSimulation = useCallback(async (params: WhatIfRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await runWhatIf(params);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const runNamedScenario = useCallback(async (name: string, baseDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await runScenario(name, baseDate);
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Scenario failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    baseline,
    scenarios,
    loading,
    error,
    loadScenarios,
    fetchBaseline,
    runCustomSimulation,
    runNamedScenario,
  };
}
