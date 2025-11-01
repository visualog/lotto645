"use client"; // This component needs client-side features

import { useState, useEffect } from "react";
import { PredictionCard } from "./PredictionCard";

// Define types for fetched data
type IntegratedRecommendationData = {
  integrated_recommendation: number[];
};

export function IntegratedRecommendation() {
  const [integratedRecData, setIntegratedRecData] = useState<IntegratedRecommendationData | null>(null);
  const [hitRate, setHitRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recommendations/integrated`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: IntegratedRecommendationData = await res.json();
        setIntegratedRecData(json);
            } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!integratedRecData) return;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchHitRate = async () => {
      try {
        const params = new URLSearchParams();
        integratedRecData.integrated_recommendation.forEach(n => params.append('numbers', String(n)));
        const res = await fetch(`${API_BASE_URL}/api/recommendations/hit-rate?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setHitRate(json.hit_rate);
      } catch (e) {
        console.error("Failed to fetch hit rate:", e);
      }
    };

    fetchHitRate();
  }, [integratedRecData]);

  if (loading) return <div className="text-center py-8">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">오류 발생: {error}</div>;
  if (!integratedRecData) return null;

  return (
    <div className="grid gap-6">
      <PredictionCard
        title="통합 분석 추천"
        description="모든 분석을 종합하여 가장 가능성이 높은 번호 조합을 추천합니다."
        numbers={integratedRecData.integrated_recommendation}
      />
    </div>
  );
}