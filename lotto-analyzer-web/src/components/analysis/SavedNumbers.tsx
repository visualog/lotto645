"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function SavedNumbers() {
  const [savedNumbers, setSavedNumbers] = useState<number[][]>([]);

  useEffect(() => {
    try {
      const savedNumbersRaw = localStorage.getItem('savedLottoNumbers');
      if (savedNumbersRaw) {
        setSavedNumbers(JSON.parse(savedNumbersRaw));
      }
    } catch (error) {
      console.error('Failed to load saved numbers:', error);
    }
  }, []);

  const handleDelete = (indexToDelete: number) => {
    try {
      const newSavedNumbers = savedNumbers.filter((_, index) => index !== indexToDelete);
      setSavedNumbers(newSavedNumbers);
      localStorage.setItem('savedLottoNumbers', JSON.stringify(newSavedNumbers));
    } catch (error) {
      console.error('Failed to delete number:', error);
      alert('번호를 삭제하는 데 실패했습니다.');
    }
  };

  const handleClearAll = () => {
    if (confirm('정말로 모든 저장된 번호를 삭제하시겠습니까?')) {
        try {
            setSavedNumbers([]);
            localStorage.removeItem('savedLottoNumbers');
        } catch (error) {
            console.error('Failed to clear all numbers:', error);
            alert('모든 번호를 삭제하는 데 실패했습니다.');
        }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>저장된 번호 목록</CardTitle>
                <CardDescription>합계 기반 추천에서 저장한 번호 조합 목록입니다.</CardDescription>
            </div>
            {savedNumbers.length > 0 && (
                <Button onClick={handleClearAll} variant="destructive">전체 삭제</Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {savedNumbers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            저장된 번호가 없습니다.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead>저장된 번호</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedNumbers.map((numbers, index) => (
                <TableRow key={index}>
                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {numbers.map(num => (
                        <span key={num} className="font-mono text-lg">{num}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handleDelete(index)} variant="outline" size="sm">삭제</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
