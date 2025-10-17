"use client"; // This component needs client-side features

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

interface FrequencyChartProps {
  data: AnalysisResult[];
}

function FrequencyChart({ data }: FrequencyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="number" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#8884d8" name="출현 횟수" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function FrequencyAnalysis() {
  const [frequencyData, setFrequencyData] = useState<FrequencyData | null>(
    null
  );
  const [mlPredictionData, setMlPredictionData] =
    useState<MlPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
    const fetchData = async () => {
      try {
        const frequencyRes = await fetch(
          `${API_BASE_URL}/api/analysis/frequency`
        );
        if (!frequencyRes.ok)
          throw new Error(`HTTP error! status: ${frequencyRes.status}`);
        const frequencyJson: FrequencyData = await frequencyRes.json();
        setFrequencyData(frequencyJson);

        const mlRes = await fetch(`${API_BASE_URL}/api/recommendations/ml`);
        if (!mlRes.ok)
          throw new Error(`HTTP error! status: ${mlRes.status}`);
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

  if (loading)
    return <div className="text-center py-8">데이터를 불러오는 중...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-500">
        오류 발생: {error}
      </div>
    );
if (!frequencyData || !mlPredictionData) return null; // Should not happen if not loading and no error

  const allNumbers = [...frequencyData.hotNumbers, ...frequencyData.coldNumbers].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>번호 출현 빈도</CardTitle>
          <CardDescription>
            가장 많이 나온 번호와 가장 적게 나온 번호의 출현 빈도를
            보여줍니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FrequencyChart data={allNumbers} />
        </CardContent>
      </Card>
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
        description="가장 자주 나온 번호는 다음 회차에서도 다시 나올 확률이 높다는 통계적 경향을 이용합니다. 이 추천 번호는 최근까지 가장 많이 나온 번호 6개를 조합한 것입니다."
        numbers={mlPredictionData.hot_numbers_prediction}
      />
    </div>
  );
}
