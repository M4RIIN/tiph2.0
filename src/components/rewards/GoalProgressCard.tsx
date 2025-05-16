"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Goal } from '@/domain/entities/Goal';
import { Reward } from '@/domain/entities/Reward';

interface GoalProgressCardProps {
  goal: Goal;
  reward?: Reward;
}

export function GoalProgressCard({ goal, reward }: GoalProgressCardProps) {
  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((goal.pointsAccumulated / goal.pointsRequired) * 100),
    100
  );

  // Determine status
  const isCompleted = goal.completed;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{goal.name}</CardTitle>
          {isCompleted && (
            <Badge className="bg-green-500">Terminé</Badge>
          )}
        </div>
        <CardDescription>
          {goal.description || 'Complétez cet objectif pour gagner une récompense'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression : {goal.pointsAccumulated} / {goal.pointsRequired} points</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {reward && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm mb-1">Récompense</h4>
            <div className="flex justify-between items-center">
              <span>{reward.name}</span>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                {reward.pointsCost} Points
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="text-sm text-gray-500">
          {isCompleted 
            ? 'Objectif atteint ! Récompense débloquée.' 
            : `${goal.pointsRequired - goal.pointsAccumulated} points supplémentaires nécessaires pour compléter cet objectif.`}
        </div>
      </CardFooter>
    </Card>
  );
}
