"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutCalendar } from "@/components/workout/WorkoutCalendar";
import { WorkoutStats } from "@/components/workout/WorkoutStats";
import { ProgramForm } from "@/components/program/ProgramForm";
import { RewardsTracker } from "@/components/rewards/RewardsTracker";

// Import domain entities
import { WorkoutSession, WorkoutType } from "@/domain/entities/WorkoutSession";
import { Program } from "@/domain/entities/Program";
import { Reward, PREDEFINED_REWARDS } from "@/domain/entities/Reward";
import { User } from "@/domain/entities/User";

// Import service hooks
import { 
  useProgramsService, 
  useWorkoutSessionsService, 
  useRewardsService, 
  usePointsService 
} from "@/infrastructure/di/ServiceProvider";

export default function Home() {
  // Get services
  const programsService = useProgramsService();
  const workoutSessionsService = useWorkoutSessionsService();
  const rewardsService = useRewardsService();
  const pointsService = usePointsService();

  // State
  const [user, setUser] = useState<User>(new User(
   "user1",
    "Tiphaine",
   "Tiphaine",
     0,
   new Date(),
    new Date()
  ));

  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [rewards] = useState<Reward[]>(PREDEFINED_REWARDS);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);

  const [showProgramForm, setShowProgramForm] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>(undefined);

  // Load data from repositories
  useEffect(() => {
    // Load programs
    const loadPrograms = async () => {
      try {
        const userPrograms = await programsService.getProgramsByUserId(user.id);
        setPrograms(userPrograms);
      } catch (error) {
        console.error("Error loading programs:", error);
      }
    };

    // Load workout sessions
    const loadWorkoutSessions = async () => {
      try {
        const sessions = await workoutSessionsService.getWorkoutSessionsByUserId(user.id);
        setWorkoutSessions(sessions);
      } catch (error) {
        console.error("Error loading workout sessions:", error);
      }
    };

    // Load unlocked rewards
    const loadUnlockedRewards = async () => {
      try {
        const userRewards = await rewardsService.getUnlockedRewards(user.id);
        setUnlockedRewards(userRewards.map(r => r.id));
      } catch (error) {
        console.error("Error loading unlocked rewards:", error);
      }
    };

    loadPrograms();
    loadWorkoutSessions();
    loadUnlockedRewards();

    // Check which rewards should be automatically unlocked based on initial points
    checkAndUnlockRewards(user.points);
  }, [user.id, programsService, workoutSessionsService, rewardsService]);

  // Check and automatically unlock rewards based on points
  const checkAndUnlockRewards = async (points: number) => {
    try {
      const newUnlockedRewards = [...unlockedRewards];
      let rewardsChanged = false;

      for (const reward of rewards) {
        if (points >= reward.pointsCost && !newUnlockedRewards.includes(reward.id)) {
          // Unlock the reward using the service
          await rewardsService.unlockReward(user.id, reward.id);
          newUnlockedRewards.push(reward.id);
          rewardsChanged = true;
        }
      }

      if (rewardsChanged) {
        setUnlockedRewards(newUnlockedRewards);
      }
    } catch (error) {
      console.error("Error checking and unlocking rewards:", error);
    }
  };

  // Handle adding a workout session
  const handleAddWorkoutSession = async (session: Partial<WorkoutSession>) => {
    try {
      // Create the session using the service
      const newSession = await workoutSessionsService.createWorkoutSession({
        userId: user.id,
        type: session.type as WorkoutType,
        date: session.date as Date,
        duration: session.duration as number,
        programId: session.programId,
        notes: session.notes
      });

      // Update local state
      setWorkoutSessions([...workoutSessions, newSession]);

      // Check if user has completed 3 sessions in the week
      const weekStart = getStartOfWeek(newSession.date);
      const sessionsInWeek = [...workoutSessions, newSession].filter(s => 
        s.userId === user.id && isInSameWeek(s.date, weekStart)
      );

      if (sessionsInWeek.length % 3 === 0) {
        // Award points for sessions in the week using the points service
        const pointsEarned = await pointsService.trackWeeklyPoints(user.id, weekStart);

        if (pointsEarned > 0) {
          // Update user with new points
          const updatedUser = {...user, points: user.points + pointsEarned};
          setUser(updatedUser);

          // Check if any new rewards should be unlocked
          checkAndUnlockRewards(updatedUser.points);
        }
      }
    } catch (error) {
      console.error("Error adding workout session:", error);
    }
  };

  // Handle saving a program
  const handleSaveProgram = async (programData: Partial<Program>) => {
    try {
      if (selectedProgram) {
        // Update existing program using the service with all data including exercises
        await programsService.updateProgram(selectedProgram.id, {
          name: programData.name,
          type: programData.type,
          description: programData.description,
          exercises: programData.exercises
        });

        // Refresh programs list
        const updatedPrograms = await programsService.getProgramsByUserId(user.id);
        setPrograms(updatedPrograms);
      } else {
        // Create new program using the service
        await programsService.createProgram({
          userId: user.id,
          name: programData.name as string,
          type: programData.type as WorkoutType,
          description: programData.description,
          exercises: programData.exercises
        });

        // Refresh programs list
        const updatedPrograms = await programsService.getProgramsByUserId(user.id);
        setPrograms(updatedPrograms);
      }

      setShowProgramForm(false);
      setSelectedProgram(undefined);
    } catch (error) {
      console.error("Error saving program:", error);
    }
  };



  // Helper functions
  const getStartOfWeek = (date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    newDate.setDate(diff);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const isInSameWeek = (date: Date, weekStart: Date) => {
    const d = new Date(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return d >= weekStart && d <= weekEnd;
  };

  return (
    <div className="container mx-auto py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Suivi de Fitness</h1>
        <div className="flex justify-between items-center mt-2">
          <p className="text-gray-500">Bienvenue, {user.name}</p>
          <div className="flex items-center gap-2">
            <span className="font-bold">{user.points} Points</span>
          </div>
        </div>
      </header>

      <Tabs defaultValue="workout" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="workout">Calendrier</TabsTrigger>
          <TabsTrigger value="programs">Programmes</TabsTrigger>
          <TabsTrigger value="rewards">Suivi</TabsTrigger>
        </TabsList>

        <TabsContent value="workout" className="space-y-4">
          <WorkoutCalendar 
            workoutSessions={workoutSessions}
            programs={programs}
            onAddSession={handleAddWorkoutSession}
          />
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {showProgramForm ? (
            <ProgramForm 
              program={selectedProgram}
              onSave={handleSaveProgram}
              onCancel={() => {
                setShowProgramForm(false);
                setSelectedProgram(undefined);
              }}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Vos Programmes</h2>
                <Button onClick={() => setShowProgramForm(true)}>
                  Créer un Nouveau Programme
                </Button>
              </div>

              {programs.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <p className="text-gray-500">Vous n&apos;avez pas encore créé de programmes.</p>
                    <Button 
                      onClick={() => setShowProgramForm(true)}
                      className="mt-4"
                    >
                      Créer Votre Premier Programme
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {programs.map(program => (
                    <Card key={program.id} className="cursor-pointer hover:shadow-md" onClick={() => {
                      setSelectedProgram(program);
                      setShowProgramForm(true);
                    }}>
                      <CardHeader>
                        <CardTitle>{program.name}</CardTitle>
                        <CardDescription>
                          {program.type.charAt(0).toUpperCase() + program.type.slice(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 mb-2">
                          {program.description || 'Pas de description'}
                        </p>
                        <p className="text-sm">{program.exercises.length} exercices</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>


        <TabsContent value="rewards" className="space-y-8">
          {/* Workout Statistics */}
          <WorkoutStats 
            workoutSessions={workoutSessions}
          />

          {/* Rewards */}
          <RewardsTracker 
            rewards={rewards}
            unlockedRewards={unlockedRewards}
            userPoints={user.points}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
