"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Reward, RewardTier } from '@/domain/entities/Reward';

interface RewardCardProps {
  reward: Reward;
  isUnlocked?: boolean;
  userPoints?: number;
  onUnlock?: () => void; // Kept for backward compatibility
}

export function RewardCard({ reward, isUnlocked = false, userPoints = 0 }: RewardCardProps) {
  const canUnlock = userPoints >= reward.pointsCost;

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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full">
        {reward.imageUrl ? (
          <Image
            src={reward.imageUrl}
            alt={reward.name}
            fill
            className="object-cover"
            onError={(e) => {
              // When image fails to load, replace with fallback
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
      <CardHeader>
        <CardTitle>{reward.name}</CardTitle>
        <CardDescription>
          {isUnlocked ? 'Débloqué' : `${reward.pointsCost} points requis`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{reward.description}</p>
      </CardContent>
      <CardFooter>
        {isUnlocked ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Débloqué
          </Badge>
        ) : canUnlock ? (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Disponible
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            Besoin de {reward.pointsCost - userPoints} points de plus
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
