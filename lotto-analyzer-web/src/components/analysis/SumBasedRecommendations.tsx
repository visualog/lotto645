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
type SumRecommendationData = {
  sum: number;
  count: number;
  recommendation: number[];
};

type FixedSumRecommendation = {
  range: string;
  recommendation: number[];
};

type SumRecommendations = {
  top_5_frequent_sums: SumRecommendationData[];
  fixed_sum_recommendations: {
    low_sum: FixedSumRecommendation;
    medium_sum: FixedSumRecommendation;
    high_sum: FixedSumRecommendation;
  };
};

export function SumBasedRecommendations() {
  const [sumRecData, setSumRecData] = useState<SumRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/recommendations/sum-based");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: SumRecommendations = await res.json();
        setSumRecData(json);
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
  if (!sumRecData) return null;

  const fixedSums = Object.entries(sumRecData.fixed_sum_recommendations);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>합계 범위별 추천</CardTitle>
          <CardDescription>
            미리 정의된 합계 범위에 따른 추천 번호 조합입니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {fixedSums.map(([key, data]) => (
            <PredictionCard
              key={key}
              title={`${data.range} 합계`}
              description={`합계 ${data.range} 범위에 대한 추천`}
              numbers={data.recommendation}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>과거 당첨 합계 기반 추천</CardTitle>
          <CardDescription>
            가장 자주 출현했던 당첨번호 합계와 그에 따른 추천 조합입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">합계</TableHead>
                <TableHead className="text-center">출현 횟수</TableHead>
                <TableHead className="text-center">추천 번호</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sumRecData.top_5_frequent_sums.map((item) => (
                <TableRow key={item.sum}>
                  <TableCell className="text-center font-medium">{item.sum}</TableCell>
                  <TableCell className="text-center">{item.count}</TableCell>
                  <TableCell className="text-center">
                    {item.recommendation.join(", ")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}