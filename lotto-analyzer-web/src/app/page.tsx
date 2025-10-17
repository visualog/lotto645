"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrequencyAnalysis } from "@/components/analysis/FrequencyAnalysis";
import { PatternAnalysis } from "@/components/analysis/PatternAnalysis";
import { TimeSeriesAnalysis } from "@/components/analysis/TimeSeriesAnalysis";
import { MachineLearningPrediction } from "@/components/analysis/MachineLearningPrediction";
import { CoOccurrenceAnalysis } from "@/components/analysis/CoOccurrenceAnalysis";
import { IntegratedRecommendation } from "@/components/analysis/IntegratedRecommendation";
import { SumBasedRecommendations } from "@/components/analysis/SumBasedRecommendations";

export default function Home() {
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchLastUpdate = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/last-update`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setLastUpdate(data.last_update);
      } catch (e) {
        console.error("Failed to fetch last update time:", e);
      }
    };

    fetchLastUpdate();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          로또 번호 분석 대시보드
        </h1>
        {lastUpdate && (
          <p className="text-sm text-gray-500 mb-6">
            데이터 최종 업데이트: {lastUpdate}
          </p>
        )}
        <Tabs defaultValue="frequency">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7 mb-4">
            <TabsTrigger value="frequency">번호 빈도 분석</TabsTrigger>
            <TabsTrigger value="patterns">패턴 분석</TabsTrigger>
            <TabsTrigger value="timeseries">시계열 분석</TabsTrigger>
            <TabsTrigger value="ml">머신러닝 예측</TabsTrigger>
            <TabsTrigger value="co-occurrence">동시 출현 분석</TabsTrigger>
            <TabsTrigger value="integrated">통합 분석 추천</TabsTrigger>
            <TabsTrigger value="sum-based">합계 기반 추천</TabsTrigger>
          </TabsList>
          <TabsContent value="frequency">
            <FrequencyAnalysis />
          </TabsContent>
          <TabsContent value="patterns">
            <PatternAnalysis />
          </TabsContent>
          <TabsContent value="timeseries">
            <TimeSeriesAnalysis />
          </TabsContent>
          <TabsContent value="ml">
            <MachineLearningPrediction />
          </TabsContent>
          <TabsContent value="co-occurrence">
            <CoOccurrenceAnalysis />
          </TabsContent>
          <TabsContent value="integrated">
            <IntegratedRecommendation />
          </TabsContent>
          <TabsContent value="sum-based">
            <SumBasedRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}