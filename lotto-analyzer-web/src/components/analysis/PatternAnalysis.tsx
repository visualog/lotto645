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
type PatternStats = {
  total_draws: number;
  odd_even_ratios: Record<string, number>;
  high_low_ratios: Record<string, number>;
  consecutive_stats: {
    count: number;
    percentage: number;
  };
  sum_stats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std_dev: number;
  };
};

type Phase1Recommendations = {
  pattern: number[];
  co_occurrence: number[];
};

// Helper to convert object to array for table mapping
const objectToAnalysisArray = (obj: Record<string, number>) => {
  return Object.entries(obj).map(([key, value]) => ({
    name: key,
    count: value,
  }));
};

export function PatternAnalysis() {
  const [patternData, setPatternData] = useState<PatternStats | null>(null);
  const [phase1RecData, setPhase1RecData] = useState<Phase1Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patternRes = await fetch("http://127.0.0.1:8000/api/analysis/patterns");
        if (!patternRes.ok) throw new Error(`HTTP error! status: ${patternRes.status}`);
        const patternJson: PatternStats = await patternRes.json();
        setPatternData(patternJson);

        const phase1RecRes = await fetch("http://127.0.0.1:8000/api/recommendations/phase1");
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
  if (!patternData || !phase1RecData) return null;

  const oddEvenData = objectToAnalysisArray(patternData.odd_even_ratios);
  const highLowData = objectToAnalysisArray(patternData.high_low_ratios);
  const sumData = [
      { name: "최소값", value: patternData.sum_stats.min },
      { name: "최대값", value: patternData.sum_stats.max },
      { name: "평균", value: patternData.sum_stats.mean },
      { name: "중앙값", value: patternData.sum_stats.median },
      { name: "표준편차", value: patternData.sum_stats.std_dev },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>홀짝 비율</CardTitle>
            <CardDescription>당첨번호의 홀수와 짝수 비율 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">비율 (홀:짝)</TableHead>
                  <TableHead className="text-center">횟수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {oddEvenData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="text-center">{item.name}</TableCell>
                    <TableCell className="text-center">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>고저 비율</CardTitle>
            <CardDescription>
              저(1-22)와 고(23-45) 숫자의 비율 분포
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">비율 (고:저)</TableHead>
                  <TableHead className="text-center">횟수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highLowData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="text-center">{item.name}</TableCell>
                    <TableCell className="text-center">{item.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>번호 총합 통계</CardTitle>
            <CardDescription>6개 당첨번호 합의 통계</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">통계</TableHead>
                  <TableHead className="text-center">값</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sumData.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="text-center">{item.name}</TableCell>
                    <TableCell className="text-center">{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>연속번호 출현</CardTitle>
            <CardDescription>연속된 번호가 포함된 회차</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-full pb-6">
              <p className="text-4xl font-bold">
                  {patternData.consecutive_stats.percentage}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                  ({patternData.total_draws}회 중 {patternData.consecutive_stats.count}회)
              </p>
          </CardContent>
        </Card>
      </div>
      <PredictionCard
        title="패턴 기반 추천"
        description="가장 흔한 홀짝/고저 비율을 만족하는 추천 조합입니다."
        numbers={phase1RecData.pattern}
      />
    </div>
  );
}
