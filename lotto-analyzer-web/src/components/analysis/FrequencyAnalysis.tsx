"use client"; // This component needs client-side features

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
type AnalysisResult = {
  number: number;
  count: number;
};

type FrequencyData = {
  hotNumbers: AnalysisResult[];
  coldNumbers: AnalysisResult[];
  hotBonusNumbers: AnalysisResult[];
  coldBonusNumbers: AnalysisResult[];
};

type MlPredictionData = {
  hot_numbers_prediction: number[];
  overdue_numbers_prediction: number[];
};

interface AnalysisTableProps {
  title: string;
  description: string;
  data: AnalysisResult[];
}

function AnalysisTable({ title, description, data }: AnalysisTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">번호</TableHead>
              <TableHead className="text-center">횟수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.number}>
                <TableCell className="text-center">{item.number}</TableCell>
                <TableCell className="text-center">{item.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function FrequencyAnalysis() {
  const [frequencyData, setFrequencyData] = useState<FrequencyData | null>(null);
  const [mlPredictionData, setMlPredictionData] = useState<MlPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
    const fetchData = async () => {
      try {
        const frequencyRes = await fetch(`${API_BASE_URL}/api/analysis/frequency`);
        if (!frequencyRes.ok) throw new Error(`HTTP error! status: ${frequencyRes.status}`);
        const frequencyJson: FrequencyData = await frequencyRes.json();
        setFrequencyData(frequencyJson);

        const mlRes = await fetch(`${API_BASE_URL}/api/recommendations/ml`);
        if (!mlRes.ok) throw new Error(`HTTP error! status: ${mlRes.status}`);
        const mlJson: MlPredictionData = await mlRes.json();
        setMlPredictionData(mlJson);

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
  if (!frequencyData || !mlPredictionData) return null; // Should not happen if not loading and no error

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AnalysisTable
          title="가장 많이 나온 번호"
          description="역대 당첨 번호 중 가장 자주 나온 상위 10개 번호입니다."
          data={frequencyData.hotNumbers}
        />
        <AnalysisTable
          title="가장 적게 나온 번호"
          description="역대 당첨 번호 중 가장 드물게 나온 하위 10개 번호입니다."
          data={frequencyData.coldNumbers}
        />
        <AnalysisTable
          title="가장 많이 나온 보너스 번호"
          description="역대 보너스 번호 중 가장 자주 나온 상위 5개 번호입니다."
          data={frequencyData.hotBonusNumbers}
        />
        <AnalysisTable
          title="가장 적게 나온 보너스 번호"
          description="역대 보너스 번호 중 가장 드물게 나온 하위 5개 번호입니다."
          data={frequencyData.coldBonusNumbers}
        />
      </div>
      <PredictionCard
        title="'핫 넘버' 기반 추천"
        description="가장 자주 나온 번호 6개를 기반으로 한 추천 조합입니다."
        numbers={mlPredictionData.hot_numbers_prediction}
      />
    </div>
  );
}
