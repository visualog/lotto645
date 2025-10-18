"use client"; // This component needs client-side features

import { useState, useEffect } from "react";
import { PredictionCard } from "./PredictionCard";

// Define types for fetched data
type MlPredictionData = {
  hot_numbers_prediction: number[];
  overdue_numbers_prediction: number[];
};

export function MachineLearningPrediction() {
  const [mlPredictionData, setMlPredictionData] = useState<MlPredictionData | null>(null);
  const [hotHitRate, setHotHitRate] = useState<number>(0);
  const [overdueHitRate, setOverdueHitRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recommendations/ml`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: MlPredictionData = await res.json();
        setMlPredictionData(json);
            } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!mlPredictionData) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchHitRates = async () => {
      try {
        const hotParams = new URLSearchParams();
        mlPredictionData.hot_numbers_prediction.forEach(n => hotParams.append('numbers', String(n)));
        const hotRes = await fetch(`${API_BASE_URL}/api/recommendations/hit-rate?${hotParams.toString()}`);
        if (hotRes.ok) {
          const hotJson = await hotRes.json();
          setHotHitRate(hotJson.hit_rate);
        }

        const overdueParams = new URLSearchParams();
        mlPredictionData.overdue_numbers_prediction.forEach(n => overdueParams.append('numbers', String(n)));
        const overdueRes = await fetch(`${API_BASE_URL}/api/recommendations/hit-rate?${overdueParams.toString()}`);
        if (overdueRes.ok) {
          const overdueJson = await overdueRes.json();
          setOverdueHitRate(overdueJson.hit_rate);
        }
      } catch (e) {
        console.error("Failed to fetch hit rates:", e);
      }
    };

    fetchHitRates();
  }, [mlPredictionData]);

  if (loading) return <div className="text-center py-8">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">오류 발생: {error}</div>;
  if (!mlPredictionData) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <PredictionCard
        title="'핫 넘버' 기반 예측"
        description="통계적으로 가장 자주 당첨된 번호들입니다."
        numbers={mlPredictionData.hot_numbers_prediction}
        confidence={hotHitRate}
      />
      <PredictionCard
        title="'콜드 넘버' 기반 예측"
        description="최근 가장 오랫동안 당첨되지 않은 번호들입니다."
        numbers={mlPredictionData.overdue_numbers_prediction}
        confidence={overdueHitRate}
      />
    </div>
  );
}
