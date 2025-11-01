"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PredictionCard } from "./PredictionCard";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

function getBallColor(number: number): string {
  if (number <= 10) return "bg-yellow-400";
  if (number <= 20) return "bg-blue-500 text-white";
  if (number <= 30) return "bg-red-500 text-white";
  if (number <= 40) return "bg-gray-600 text-white";
  return "bg-green-500 text-white";
}

// --- Type Definitions ---
type SumRecommendationData = {
  sum: number;
  count: number;
  recommendation: number[] | string;
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

// --- Main Component ---
export function SumBasedRecommendations() {
  // --- States ---
  const [sumRecData, setSumRecData] = useState<SumRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for custom slider recommendation
  const [customSumRange, setCustomSumRange] = useState<[number, number]>([100, 150]);
  const [customRecommendation, setCustomRecommendation] = useState<number[] | string | null>(null);
  const [customLoading, setCustomLoading] = useState(true);
  const [customError, setCustomError] = useState<string | null>(null);

  // --- API Fetching Logic ---

  // Generic function to fetch a recommendation for a given sum range
  const fetchRecommendationByRange = useCallback(async (min: number, max: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/sum-range?min_sum=${min}&max_sum=${max}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.recommendation;
    } catch (e: any) {
      console.error(`Failed to fetch sum-range recommendation for ${min}-${max}:`, e);
      return `오류: ${e.message}`;
    }
  }, []);

  // Fetch initial data for fixed and top-5 recommendations
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/sum-based`);
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              const json: SumRecommendations = await res.json();
              if (!json.fixed_sum_recommendations || !json.top_5_frequent_sums) {
                throw new Error("Invalid data structure received from server.");
              }
              setSumRecData(json);    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch recommendation for the custom slider
  const fetchCustomRecommendation = useCallback(async (min: number, max: number) => {
    setCustomLoading(true);
    setCustomError(null);
    const result = await fetchRecommendationByRange(min, max);
    setCustomRecommendation(result);
    setCustomLoading(false);
  }, [fetchRecommendationByRange]);

  useEffect(() => {
    fetchCustomRecommendation(customSumRange[0], customSumRange[1]);
  }, [fetchCustomRecommendation]);

  // --- Event Handlers ---

  const handleSave = (numbers: number[]) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return;

    try {
      const savedNumbersRaw = localStorage.getItem('savedLottoNumbers');
      const savedNumbers: number[][] = savedNumbersRaw ? JSON.parse(savedNumbersRaw) : [];

      // 중복 확인
      const isDuplicate = savedNumbers.some(saved => JSON.stringify(saved) === JSON.stringify(numbers));

      if (isDuplicate) {
        alert('이미 저장된 번호 조합입니다.');
        return;
      }

      const newSavedNumbers = [...savedNumbers, numbers];
      localStorage.setItem('savedLottoNumbers', JSON.stringify(newSavedNumbers));
      alert('번호가 저장되었습니다!');
    } catch (error) {
      console.error('Failed to save numbers:', error);
      alert('번호를 저장하는 데 실패했습니다.');
    }
  };

  // Refresh a fixed recommendation
  const handleFixedRefresh = async (key: string, range: string) => {
    const [min, max] = range.split('-').map(Number);
    if (!sumRecData || isNaN(min) || isNaN(max)) return;

    const newRecommendation = await fetchRecommendationByRange(min, max);

    setSumRecData(prevData => {
        if (!prevData) return null;
        const newData = { ...prevData };
        (newData.fixed_sum_recommendations[key as keyof typeof newData.fixed_sum_recommendations] as FixedSumRecommendation).recommendation = newRecommendation;
        return newData;
    });
  };

  // Handle custom slider value commit
  const handleCustomRangeCommit = (newRange: [number, number]) => {
    setCustomSumRange(newRange);
    fetchCustomRecommendation(newRange[0], newRange[1]);
  };

  // Handle custom slider refresh button
  const handleCustomRefresh = () => {
    fetchCustomRecommendation(customSumRange[0], customSumRange[1]);
  };

  // --- Render Logic ---

  if (loading) return <div className="text-center py-8">데이터를 불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-500">오류 발생: {error}</div>;
  if (!sumRecData) return null;

  const fixedSums = Object.entries(sumRecData.fixed_sum_recommendations);

  return (
    <div className="space-y-6">
      {/* --- Fixed Range Recommendations --*/}
      <Card>
        <CardHeader>
          <CardTitle>합계 범위별 추천</CardTitle>
          <CardDescription>미리 정의된 합계 범위에 따른 추천 번호 조합입니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {fixedSums.map(([key, data]) => (
            <div key={key} className="flex flex-col">
              <PredictionCard
                title={`${data.range} 합계`}
                description={`합계 ${data.range} 범위에 대한 추천`}
                numbers={Array.isArray(data.recommendation) ? data.recommendation : []}
              />
                            <div className="mt-2 flex justify-center gap-2">
                <Button onClick={() => handleFixedRefresh(key, data.range)}>
                  🔄 다른 번호 보기
                </Button>
                <Button onClick={() => handleSave(data.recommendation)} variant="outline">
                  💾 저장
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- Custom Range Recommendations (Slider) --*/}
      <Card>
        <CardHeader>
          <CardTitle>사용자 지정 합계 범위 추천</CardTitle>
          <CardDescription>슬라이더를 조절하여 원하는 번호 합계 범위를 설정하고, 해당 범위에 속하는 번호 조합을 추천받으세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center font-medium">
              <span>합계 범위:</span>
              <span>{customSumRange[0]} - {customSumRange[1]}</span>
            </div>
            <Slider
              defaultValue={customSumRange}
              min={21} // 1+2+3+4+5+6
              max={255} // 40+41+42+43+44+45
              step={1}
              onValueChange={(newRange) => setCustomSumRange(newRange)}
              onValueCommit={handleCustomRangeCommit}
            />
          </div>
                    <div className="text-center flex justify-center gap-2">
            <Button onClick={handleCustomRefresh} disabled={customLoading}>
              {customLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "🔄"}
              다른 번호 보기
            </Button>
            <Button 
              onClick={() => handleSave(customRecommendation as number[])} 
              disabled={customLoading || !Array.isArray(customRecommendation)}
              variant="outline"
            >
              💾 저장
            </Button>
          </div>
          <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg min-h-[100px] flex items-center justify-center">
            {customLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            ) : customError ? (
              <p className="text-red-500">{customError}</p>
            ) : customRecommendation && Array.isArray(customRecommendation) ? (
              <div className="flex items-center space-x-2">
                {customRecommendation.map((num) => (
                                    <div
                                      key={num}
                                      className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold",
                                        getBallColor(num)
                                      )}
                                    >
                    {num}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">{typeof customRecommendation === 'string' ? customRecommendation : "추천 번호를 생성할 수 없습니다."}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Top 5 Frequent Sums --*/}
      <Card>
        <CardHeader>
          <CardTitle>과거 당첨 합계 기반 추천</CardTitle>
          <CardDescription>가장 자주 출현했던 당첨번호 합계와 그에 따른 추천 조합입니다.</CardDescription>
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
                    {Array.isArray(item.recommendation) ? item.recommendation.join(", ") : item.recommendation}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="text-center mt-4">
            <Button onClick={fetchInitialData} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "🔄"}
                다른 조합 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
