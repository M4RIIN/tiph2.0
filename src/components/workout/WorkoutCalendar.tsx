"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from '../ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { WorkoutSession, WorkoutType } from '@/domain/entities/WorkoutSession';
import {Program, ProgramExercise} from '@/domain/entities/Program';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
// Removed recharts imports as we're using custom bars

interface WorkoutCalendarProps {
  workoutSessions: WorkoutSession[];
  programs: Program[];
  onAddSession?: (session: Partial<WorkoutSession>) => void;
  onSelectSession?: (session: WorkoutSession) => void;
}

export function WorkoutCalendar({ 
  workoutSessions, 
  programs, 
  onAddSession, 
  onSelectSession 
}: WorkoutCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]);

  // Form state
  const [workoutType, setWorkoutType] = useState<WorkoutType>('crossfit');
  const [duration, setDuration] = useState('60');
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Define workout type colors based on shadcn theme
  const workoutTypeColors: Record<WorkoutType, string> = {
    'crossfit': 'bg-chart-1 hover:bg-chart-1',
    'pilates': 'bg-chart-2 hover:bg-chart-2',
    'gym': 'bg-chart-3 hover:bg-chart-3',
    'running': 'bg-chart-4 hover:bg-chart-4',
    'swimming': 'bg-chart-5 hover:bg-chart-5',
    'yoga': 'bg-primary hover:bg-primary',
    'other': 'bg-secondary hover:bg-secondary'
  };

  // Create a map of dates with workout sessions
  const workoutDatesMap = useMemo(() => {
    const map = new Map<string, WorkoutType[]>();

    workoutSessions.forEach(session => {
      const dateStr = new Date(session.date).toDateString();
      const types = map.get(dateStr) || [];
      if (!types.includes(session.type)) {
        types.push(session.type);
      }
      map.set(dateStr, types);
    });

    return map;
  }, [workoutSessions]);

  // Get sessions for the selected date
  const getSessionsForDate = (date: Date | undefined) => {
    if (!date) return [];

    return workoutSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const sessionsForSelectedDate = selectedDate ? getSessionsForDate(selectedDate) : [];

  // Calculate total workout time for the day
  const totalWorkoutTime = sessionsForSelectedDate.reduce((total, session) => total + session.duration, 0);

  // Calculate time spent on each exercise within programs
  const exerciseTimeData = useMemo(() => {
    const exerciseData: Record<string, { time?: number, sets?: number, reps?: number }> = {};

    sessionsForSelectedDate.forEach(session => {
      const program = programs.find(p => p.id === session.programId);
      if (!program) return;

      // Get exercises from program
      const exercises: ProgramExercise[] = Array.isArray(program.exercises) ? program.exercises : Object.values(program.exercises);

      // We don't need to calculate totalExerciseDuration anymore as we're using a different approach

      exercises.forEach((exercise : ProgramExercise) => {
        const exerciseName = exercise.name;

        if (!exerciseData[exerciseName]) {
          exerciseData[exerciseName] = {};
        }

        // If the exercise has a specific duration, use that (priority)
        if (exercise.duration) {
          exerciseData[exerciseName].time = (exerciseData[exerciseName].time || 0) + exercise.duration;
        } 
        // Otherwise, store sets and reps for calculation
        else {
          exerciseData[exerciseName].sets = (exerciseData[exerciseName].sets || 0) + exercise.sets;
          exerciseData[exerciseName].reps = exercise.reps;
        }
      });
    });

    // Calculate size based on time or sets*reps
    return Object.entries(exerciseData)
      .map(([name, data], index) => {
        let value = 0;
        let sizeType = 'fixed';

        // Priority 1: Use time if available
        if (data.time && data.time > 0) {
          value = data.time;
          sizeType = 'time';
        } 
        // Priority 2: Use sets*reps*5 seconds if available
        else if (data.sets && data.reps) {
          value = (data.sets * data.reps * 5) / 60; // Convert to minutes
          sizeType = 'reps';
        } 
        // Priority 3: Use fixed size
        else {
          value = 10; // Fixed size in minutes
        }

        return {
          name,
          value: Math.round(value),
          sizeType,
          color: [
            '#ef4444', // red
            '#a855f7', // purple
            '#3b82f6', // blue
            '#22c55e', // green
            '#06b6d4', // cyan
            '#eab308', // yellow
            '#6b7280', // gray
          ][index % 7]
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by value in descending order
  }, [sessionsForSelectedDate, programs]);

  // Toggle session expansion
  const toggleSessionExpansion = (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the card click event
    setExpandedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId) 
        : [...prev, sessionId]
    );
  };

  // Handle adding a new session
  const handleAddSession = () => {
    if (!selectedDate || !onAddSession) return;

    onAddSession({
      type: workoutType,
      date: selectedDate,
      duration: parseInt(duration),
      programId: selectedProgramId === "none" ? undefined : selectedProgramId,
      notes: notes.trim() ? notes : undefined
    });

    // Reset form
    setWorkoutType('crossfit');
    setDuration('60');
    setSelectedProgramId(undefined);
    setNotes('');
    setIsAddDialogOpen(false);
  };

  // Get programs for the selected workout type
  const programsForType = programs.filter(program => program.type === workoutType);

  // Reset selected program if it's not compatible with the new workout type
  useEffect(() => {
    if (selectedProgramId) {
      const programExists = programsForType.some(program => program.id === selectedProgramId);
      if (!programExists) {
        setSelectedProgramId(undefined);
      }
    }
  }, [workoutType, selectedProgramId, programsForType]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Calendrier</CardTitle>
          <CardDescription>Sélectionnez une date pour voir ou ajouter des séances d&apos;entraînement</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiers={{
              workout: (date) => {
                const dateStr = date.toDateString();
                return workoutDatesMap.has(dateStr);
              }
            }}
            modifiersClassNames={{
              workout: "workout-day-base"
            }}
            components={{
              Day: (props) => {
                const dateStr = props.date.toDateString();
                const workoutTypes = workoutDatesMap.get(dateStr) || [];
                const dayNumber = props.date.getDate();

                // Check if the day is outside the current month
                // @ts-expect-error fedz
                const isOutsideCurrentMonth = props.outside === true;

                // Check if this day is the selected date
                const isSelected = selectedDate && 
                  props.date.getDate() === selectedDate.getDate() &&
                  props.date.getMonth() === selectedDate.getMonth() &&
                  props.date.getFullYear() === selectedDate.getFullYear();

                // Handle click on day to only update selected date
                const handleDayClick = () => {
                  setSelectedDate(props.date);
                };

                if (workoutTypes.length > 0) {
                  // Use the first workout type for the color
                  const primaryType = workoutTypes[0];
                  const colorClass = workoutTypeColors[primaryType];

                  return (
                    <div 
                      className="relative w-full h-full cursor-pointer" 
                      onClick={handleDayClick}
                    >
                      <div 
                        className={cn(
                          "absolute inset-0 rounded-md opacity-70", 
                          colorClass
                        )}
                      />
                      <div className={cn(
                        "relative z-10 flex items-center justify-center w-full h-full font-medium",
                        isOutsideCurrentMonth ? "text-muted-foreground opacity-50" : "text-foreground"
                      )}>
                        {dayNumber}
                      </div>
                    </div>
                  );
                }

                return (
                  <div 
                    className={cn(
                      "flex items-center justify-center w-full h-full font-medium cursor-pointer rounded-md",
                      isOutsideCurrentMonth ? "text-muted-foreground opacity-50" : "text-foreground",
                      isSelected && "bg-accent"
                    )}
                    onClick={handleDayClick}
                  >
                    {dayNumber}
                  </div>
                );
              }
            }}
          />

        </CardContent>
        <CardFooter>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">Ajouter une Séance pour le {selectedDate?.toLocaleDateString('fr-FR')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une Séance d&apos;Entraînement</DialogTitle>
                <DialogDescription>
                  Ajouter une nouvelle séance d&apos;entraînement pour le {selectedDate?.toLocaleDateString('fr-FR')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="workout-type" className="text-right">Type</Label>
                  <Select 
                    value={workoutType} 
                    onValueChange={(value: string) => setWorkoutType(value as WorkoutType)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner le type d&apos;entraînement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crossfit">CrossFit</SelectItem>
                      <SelectItem value="pilates">Pilates</SelectItem>
                      <SelectItem value="gym">Salle de sport</SelectItem>
                      <SelectItem value="running">Course</SelectItem>
                      <SelectItem value="swimming">Natation</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="duration" className="text-right">Durée (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="program" className="text-right">Programme</Label>
                  <Select 
                    value={selectedProgramId} 
                    onValueChange={setSelectedProgramId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un programme (optionel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      {programsForType.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3"
                    placeholder="Notes optionnelles sur cette séance"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" onClick={handleAddSession}>Ajouter la Séance</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            Séances d&apos;Entraînement pour le {selectedDate?.toLocaleDateString('fr-FR')}
          </CardTitle>
          <CardDescription>
            {sessionsForSelectedDate.length 
              ? `${sessionsForSelectedDate.length} séance(s) programmée(s) - Temps total: ${totalWorkoutTime} min` 
              : 'Aucune séance programmée pour cette date'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsForSelectedDate.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune séance d&apos;entraînement programmée pour cette date.
              <br />
              Cliquez sur &quot;Ajouter une Séance d&apos;Entraînement&quot; pour en programmer une.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary card showing total workout time */}
              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">Temps total d&apos;entraînement:</span>
                    </div>
                    <Badge variant="outline" className="text-base font-semibold">{totalWorkoutTime} minutes</Badge>
                  </div>

                  {/* Exercise time distribution chart */}
                  {exerciseTimeData.length > 0 && (
                    <div className="mt-4">
                      <Separator className="my-2" />
                      <p className="text-sm font-medium mb-2">Répartition:</p>
                      <p className="text-xs text-muted-foreground mb-2">Les barres colorées ci-dessous représentent le temps consacré à chaque exercice.</p>
                      <div className="mt-3 space-y-3">
                        <div className="flex w-full">
                          {exerciseTimeData.map((entry, index) => {
                            // Calculate relative flex-grow based on value
                            const value = entry.value;

                            return (
                              <div 
                                key={index} 
                                className="flex-grow mx-1 first:ml-0 last:mr-0 mb-3"
                                style={{ flexGrow: value }}
                              >
                                <div
                                  className="h-4 rounded-lg"
                                  style={{ backgroundColor: entry.color }}
                                  title={`${entry.name}: ${entry.value} ${entry.sizeType === 'time' ? 'min' : entry.sizeType === 'reps' ? 'min (estimé)' : 'min (fixe)'}`}
                                >
                                </div>
                                <div className="mt-1 text-xs text-center truncate" title={entry.name}>
                                  {entry.name}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session cards */}
              {sessionsForSelectedDate.map(session => {
                const program = programs.find(p => p.id === session.programId);
                const isExpanded = expandedSessions.includes(session.id);

                return (
                  <Card 
                    key={session.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => onSelectSession && onSelectSession(session)}
                  >
                    <CardHeader className="py-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{session.type.charAt(0).toUpperCase() + session.type.slice(1)}</CardTitle>
                        <span className="text-sm text-gray-500">{session.duration} min</span>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      {program && (
                        <div className="mb-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm font-medium">Programme : </span>
                              <span className="text-sm">{program.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 h-8 w-8"
                              onClick={(e) => toggleSessionExpansion(session.id, e)}
                            >
                              {isExpanded ? 
                                <ChevronUp className="h-5 w-5" /> : 
                                <ChevronDown className="h-5 w-5" />
                              }
                            </Button>
                          </div>

                          {isExpanded && (Array.isArray(program.exercises) ? program.exercises.length > 0 : Object.keys(program.exercises).length > 0) && (
                            <div className="mt-3 space-y-3">
                              <Separator />
                              <div className="text-sm font-medium">Détails des exercices:</div>
                              <div className="space-y-2">
                                {((Array.isArray(program.exercises) ? program.exercises : Object.values(program.exercises)) as ProgramExercise[]).map((exercise, index) => (
                                  <div key={index} className="bg-muted/30 p-2 rounded-md">
                                    <div className="font-medium">{exercise.name}</div>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge variant="outline">{exercise.sets} séries</Badge>
                                      <Badge variant="outline">{exercise.reps} répétitions</Badge>
                                      {exercise.weight && <Badge variant="outline">{exercise.weight} kg</Badge>}
                                      {exercise.duration && <Badge variant="outline">{exercise.duration} min</Badge>}
                                    </div>
                                    {exercise.notes && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {exercise.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {session.notes && (
                        <div>
                          <span className="text-sm font-medium">Notes : </span>
                          <span className="text-sm">{session.notes}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
