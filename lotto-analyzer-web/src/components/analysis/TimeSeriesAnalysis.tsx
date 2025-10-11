"use client"; // Recharts components are client components

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define types for fetched data
type TimeSeriesDataPoint = {
  name: string;
  sum: number;
  moving_average: number | null;
};

export function TimeSeriesAnalysis() {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/analysis/timeseries");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: TimeSeriesDataPoint[] = await res.json();
        setTimeSeriesData(json);
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
  if (!timeSeriesData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>당첨번호 총합 시계열 분석</CardTitle>
        <CardDescription>
          시간에 따른 당첨번호 총합의 추세 (52주 이동평균)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={timeSeriesData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="sum"
              name="회차별 총합"
              stroke="#8884d8"
              dot={false}
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="moving_average"
              name="52주 이동평균"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}