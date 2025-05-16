"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkoutSession, WorkoutType } from '@/domain/entities/WorkoutSession';
import { 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface WorkoutBarChartProps {
  workoutSessions: WorkoutSession[];
}

// Helper function to get color based on workout type
const getWorkoutTypeColor = (type: WorkoutType): string => {
  switch (type) {
    case 'crossfit': return '#ef4444'; // red-500
    case 'pilates': return '#a855f7'; // purple-500
    case 'gym': return '#3b82f6'; // blue-500
    case 'running': return '#22c55e'; // green-500
    case 'swimming': return '#06b6d4'; // cyan-500
    case 'yoga': return '#eab308'; // yellow-500
    case 'other': return '#6b7280'; // gray-500
    default: return '#6b7280'; // gray-500
  }
};

type TimeRange = 'currentMonth' | 'last3Months' | 'allTime';

export function WorkoutBarChart({ workoutSessions }: WorkoutBarChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('currentMonth');

  // Helper function to filter sessions based on time range
  const filterSessionsByTimeRange = (sessions: WorkoutSession[], range: TimeRange): WorkoutSession[] => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (range) {
      case 'currentMonth':
        return sessions.filter(session => {
          const sessionDate = new Date(session.date);
          return sessionDate.getMonth() === currentMonth && 
                 sessionDate.getFullYear() === currentYear;
        });
      case 'last3Months':
        return sessions.filter(session => {
          const sessionDate = new Date(session.date);
          const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
          return sessionDate >= threeMonthsAgo && sessionDate <= today;
        });
      case 'allTime':
        return sessions;
      default:
        return sessions;
    }
  };

  // Generate distribution data based on selected time range
  const distributionData = useMemo(() => {
    const filteredSessions = filterSessionsByTimeRange(workoutSessions, timeRange);

    // Count sessions by type
    const typeCount: Record<WorkoutType, number> = {
      'crossfit': 0,
      'pilates': 0,
      'gym': 0,
      'running': 0,
      'swimming': 0,
      'yoga': 0,
      'other': 0
    };

    filteredSessions.forEach(session => {
      typeCount[session.type]++;
    });

    // Convert to array format for PieChart
    return Object.entries(typeCount)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        value: count,
        color: getWorkoutTypeColor(type as WorkoutType)
      }));
  }, [workoutSessions, timeRange]);



  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Séances d&apos;Entraînement</CardTitle>
            <CardDescription>Visualisation de vos séances d&apos;entraînement</CardDescription>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Tabs 
              value={timeRange} 
              onValueChange={(value) => setTimeRange(value as TimeRange)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="currentMonth">Mois en cours</TabsTrigger>
                <TabsTrigger value="last3Months">3 derniers mois</TabsTrigger>
                <TabsTrigger value="allTime">Total</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              {/* Responsive center text with larger font size */}
              <g className="recharts-layer recharts-pie-labels">
                <text
                  x="50%"
                  y="39%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-semibold"
                  style={{ 
                    fontSize: window.innerWidth < 640 ? '16px' : '20px',
                    fontWeight: 600
                  }}
                >
                  {distributionData.reduce((sum, entry) => sum + entry.value, 0)}
                </text>
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-medium"
                  style={{ 
                    fontSize: window.innerWidth < 640 ? '12px' : '16px',
                    fontWeight: 500
                  }}
                >
                  séances
                </text>
              </g>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius="50%"
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} séance${value > 1 ? 's' : ''}`, name]}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => <span style={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* No data message */}
        {distributionData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Aucune donnée disponible pour cette période</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
