"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkoutSession, WorkoutType } from '@/domain/entities/WorkoutSession';
import { format, eachMonthOfInterval, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WorkoutBarChart } from './WorkoutBarChart';

interface WorkoutStatsProps {
  workoutSessions: WorkoutSession[];
}

// Helper function to get color based on workout type
const getWorkoutTypeColor = (type: WorkoutType): string => {
  switch (type) {
    case 'crossfit': return 'bg-red-500';
    case 'pilates': return 'bg-purple-500';
    case 'gym': return 'bg-blue-500';
    case 'running': return 'bg-green-500';
    case 'swimming': return 'bg-cyan-500';
    case 'yoga': return 'bg-yellow-500';
    case 'other': return 'bg-gray-500';
    default: return 'bg-gray-500';
  }
};


export function WorkoutStats({ workoutSessions }: WorkoutStatsProps) {
  // State for filter selection (total or specific month)
  const [selectedFilter] = useState<string>("total");

  // Get the last 6 months
  useMemo(() => {
    const today = new Date();
    return eachMonthOfInterval({
      start: subMonths(today, 5),
      end: today
    });
  }, []);
// Calculate sessions by type, filtered by month if selected
  useMemo(() => {
    const typeCount: Record<WorkoutType, number> = {
      'crossfit': 0,
      'pilates': 0,
      'gym': 0,
      'running': 0,
      'swimming': 0,
      'yoga': 0,
      'other': 0
    };

    // Filter sessions by selected month if not "total"
    const filteredSessions = selectedFilter === "total"
        ? workoutSessions
        : workoutSessions.filter(session => {
          const sessionDate = new Date(session.date);
          const selectedMonth = new Date(selectedFilter);
          return sessionDate.getMonth() === selectedMonth.getMonth() &&
              sessionDate.getFullYear() === selectedMonth.getFullYear();
        });

    filteredSessions.forEach(session => {
      typeCount[session.type]++;
    });

    return Object.entries(typeCount)
        .map(([type, count]) => ({ type: type as WorkoutType, count }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count);
  }, [workoutSessions, selectedFilter]);
// Calculate total sessions (filtered by month if selected)
  const totalSessions = useMemo(() => {
    if (selectedFilter === "total") {
      return workoutSessions.length;
    } else {
      const selectedMonth = new Date(selectedFilter);
      return workoutSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getMonth() === selectedMonth.getMonth() && 
               sessionDate.getFullYear() === selectedMonth.getFullYear();
      }).length;
    }
  }, [workoutSessions, selectedFilter]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Statistiques d&apos;Entraînement</h2>
        <Card className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md border-0">
          <CardContent className="p-4 flex items-center justify-center">
            <span className="font-bold text-lg">{totalSessions} Séances Totales</span>
          </CardContent>
        </Card>
      </div>

      {/* Workout Sessions Chart */}
      <WorkoutBarChart workoutSessions={workoutSessions} />


      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Séances Récentes</CardTitle>
          <CardDescription>Vos dernières séances d&apos;entraînement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workoutSessions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getWorkoutTypeColor(session.type)}`}>
                      {session.type.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{session.type.charAt(0).toUpperCase() + session.type.slice(1)}</p>
                      <p className="text-xs text-gray-500">{format(new Date(session.date), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{session.duration} min</Badge>
                </div>
              ))}

            {workoutSessions.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Aucune séance d&apos;entraînement enregistrée
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
