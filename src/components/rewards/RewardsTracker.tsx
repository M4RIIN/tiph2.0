"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Reward, RewardTier } from '@/domain/entities/Reward';
import Image from 'next/image';

interface RewardsTrackerProps {
  rewards: Reward[];
  unlockedRewards: string[];
  userPoints: number;
}

export function RewardsTracker({ rewards, unlockedRewards, userPoints }: RewardsTrackerProps) {
  // Sort rewards by point cost
  const sortedRewards = [...rewards].sort((a, b) => a.pointsCost - b.pointsCost);

  // Calculate max points for progress bar
  const maxPoints = Math.max(...rewards.map(r => r.pointsCost));

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (userPoints / maxPoints) * 100);

  // Map tier to color
  const getTierColor = (tier: RewardTier) => {
    switch (tier) {
      case 'tier1': return 'bg-blue-500';
      case 'tier2': return 'bg-green-500';
      case 'tier3': return 'bg-yellow-500';
      case 'tier4': return 'bg-purple-500';
      case 'tier5': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Map tier to text color
  const getTierTextColor = (tier: RewardTier) => {
    switch (tier) {
      case 'tier1': return 'text-blue-500';
      case 'tier2': return 'text-green-500';
      case 'tier3': return 'text-yellow-500';
      case 'tier4': return 'text-purple-500';
      case 'tier5': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get reward status
  const getRewardStatus = (reward: Reward) => {
    if (unlockedRewards.includes(reward.id)) {
      return { status: 'unlocked', label: 'Débloqué', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (userPoints >= reward.pointsCost) {
      return { status: 'available', label: 'Disponible', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    } else {
      return { 
        status: 'locked', 
        label: `${reward.pointsCost - userPoints} points de plus`, 
        color: 'bg-gray-100 text-gray-800 border-gray-300' 
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with points */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Récompenses</h2>
        <Card className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md border-0">
          <CardContent className="p-4 flex items-center justify-center">
            <span className="font-bold text-lg">{userPoints} Points Disponibles</span>
          </CardContent>
        </Card>
      </div>

      {/* Progress tracker */}
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Progression des Récompenses</CardTitle>
          <CardDescription>
            Complétez des entraînements pour gagner des points et débloquer des récompenses
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm font-medium">{userPoints} / {maxPoints} points</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Rewards timeline - Desktop */}
      <div className="hidden md:block">
        <h3 className="text-lg font-semibold mb-4">Parcours des Récompenses</h3>
        <Card className="p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200"></div>

            {/* Timeline items */}
            <div className="space-y-8">
              {sortedRewards.map((reward) => {
                const status = getRewardStatus(reward);

                return (
                  <div key={reward.id} className="flex items-start relative z-10">
                    {/* Point marker */}
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mr-4 transition-all duration-300 ${
                        status.status === 'unlocked' 
                          ? 'bg-green-500 text-white' 
                          : status.status === 'available' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white border-2 border-gray-300 text-gray-500'
                      }`}
                    >
                      {status.status === 'unlocked' ? '✓' : reward.pointsCost}
                    </div>

                    {/* Reward card */}
                    <div className="flex-1">
                      <Card className="overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          {/* Reward image */}
                          <div className="relative h-24 sm:h-auto sm:w-1/4 min-w-[100px]">
                            {reward.imageUrl ? (
                              <Image
                                src={reward.imageUrl}
                                alt={reward.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement('div');
                                    fallback.className = "h-full w-full bg-gray-200 flex items-center justify-center";
                                    fallback.innerHTML = '<span class="text-gray-500">Pas d\'image</span>';
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">Pas d&apos;image</span>
                              </div>
                            )}
                          </div>

                          {/* Reward details */}
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{reward.name}</h4>
                                <p className={`text-xs ${getTierTextColor(reward.tier)}`}>
                                  Niveau {reward.tier.replace('tier', '')}
                                </p>
                              </div>
                              <Badge variant="outline" className={status.color}>
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{reward.description}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards timeline - Mobile */}
      <div className="md:hidden">
        <h3 className="text-lg font-semibold mb-4">Parcours des Récompenses</h3>

        {/* Mobile timeline */}
        <div className="relative mb-6 pb-2 overflow-x-auto">
          <div className="flex space-x-6 min-w-max px-2 relative">
            {/* Horizontal line - positioned to match the width of all reward items */}
            <div className="absolute top-6 left-2 right-2 h-0.5 bg-gray-200" style={{ zIndex: -1 }}></div>

            {sortedRewards.map((reward) => {
              const status = getRewardStatus(reward);

              return (
                <Popover key={reward.id}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="flex flex-col items-center p-0 h-auto">
                      {/* Point marker */}
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-2 transition-all duration-300 ${
                          status.status === 'unlocked' 
                            ? 'bg-green-500 text-white' 
                            : status.status === 'available' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white border-2 border-gray-300 text-gray-500'
                        }`}
                      >
                        {status.status === 'unlocked' ? '✓' : reward.pointsCost}
                      </div>

                      {/* Reward name */}
                      <span className="text-xs font-medium text-center max-w-[80px] truncate">
                        {reward.name}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-0">
                    <Card className="border-0 shadow-none">
                      <div className="relative h-32 w-full">
                        {reward.imageUrl ? (
                          <Image
                            src={reward.imageUrl}
                            alt={reward.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = "h-full w-full bg-gray-200 flex items-center justify-center";
                                fallback.innerHTML = '<span class="text-gray-500">Pas d\'image</span>';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500">Pas d&apos;image</span>
                          </div>
                        )}
                        <Badge className={`absolute top-2 right-2 ${getTierColor(reward.tier)}`}>
                          {reward.pointsCost} Points
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{reward.name}</CardTitle>
                        <CardDescription>
                          {status.status === 'unlocked' ? 'Débloqué' : `${reward.pointsCost} points requis`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{reward.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </CardFooter>
                    </Card>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </div>

        {/* Mobile reward cards */}
        <div className="space-y-4">
          {sortedRewards.map((reward) => {
            const status = getRewardStatus(reward);

            return (
              <Card key={reward.id} className="overflow-hidden">
                <div className="flex">
                  {/* Reward image/avatar */}
                  <div className="relative h-24 w-24 flex-shrink-0">
                    {reward.imageUrl ? (
                      <Image
                        src={reward.imageUrl}
                        alt={reward.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = "h-full w-full bg-gray-200 flex items-center justify-center";
                            fallback.innerHTML = '<span class="text-gray-500">Pas d\'image</span>';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Pas d&apos;image</span>
                      </div>
                    )}
                  </div>

                  {/* Reward details */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{reward.name}</h4>
                        <p className={`text-xs ${getTierTextColor(reward.tier)}`}>
                          Niveau {reward.tier.replace('tier', '')}
                        </p>
                      </div>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{reward.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
