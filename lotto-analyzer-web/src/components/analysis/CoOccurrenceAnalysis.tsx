"use client"; // This component needs client-side features

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PredictionCard } from "./PredictionCard";

// Define types for fetched data
type CoOccurrenceDataPoint = {
  pair: string;
  count: number;
};

type Phase1Recommendations = {
  pattern: number[];
  co_occurrence: number[];
};

export function CoOccurrenceAnalysis() {
  const [coOccurrenceData, setCoOccurrenceData] = useState<CoOccurrenceDataPoint[] | null>(null);
  const [phase1RecData, setPhase1RecData] = useState<Phase1Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchData = async () => {
      try {
        const coOccurrenceRes = await fetch(`${API_BASE_URL}/api/analysis/cooccurrence`);
        if (!coOccurrenceRes.ok) throw new Error(`HTTP error! status: ${coOccurrenceRes.status}`);
        const coOccurrenceJson: CoOccurrenceDataPoint[] = await coOccurrenceRes.json();
        setCoOccurrenceData(coOccurrenceJson);

        const phase1RecRes = await fetch(`${API_BASE_URL}/api/recommendations/phase1`);
        if (!phase1RecRes.ok) throw new Error(`HTTP error! status: ${phase1RecRes.status}`);
        const phase1RecJson: Phase1Recommendations = await phase1RecRes.json();
        setPhase1RecData(phase1RecJson);

      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">오류 발생: {error}</div>;
  if (!coOccurrenceData || !phase1RecData) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>동시 출현 빈도 분석</CardTitle>
          <CardDescription>
            함께 가장 자주 당첨된 번호 조합 상위 20개
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">번호 조합</TableHead>
                <TableHead className="text-center">동시 출현 횟수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coOccurrenceData.map((item) => (
                <TableRow key={item.pair}>
                  <TableCell className="text-center font-medium">{item.pair}</TableCell>
                  <TableCell className="text-center">{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PredictionCard
        title="동시 출현 기반 추천"
        description="동시 출현 빈도가 높은 번호들을 기반으로 한 추천 조합입니다."
        numbers={phase1RecData.co_occurrence}
        confidence={Math.floor(Math.random() * 21) + 30} // Placeholder: 30-50%
      />
    </div>
  );
}
