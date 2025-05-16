export type RewardTier = 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5';

export class Reward {
  id: string;
  name: string;
  description: string;
  tier: RewardTier;
  pointsCost: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, name: string, description: string, tier: RewardTier, pointsCost: number, imageUrl: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.tier = tier;
    this.pointsCost = pointsCost;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

// Update reward details
  updateDetails(
    name?: string,
    description?: string,
    tier?: RewardTier,
    pointsCost?: number,
    imageUrl?: string
  ): void {
    if (name) this.name = name;
    if (description) this.description = description;
    if (tier) this.tier = tier;
    if (pointsCost) this.pointsCost = pointsCost;
    if (imageUrl) this.imageUrl = imageUrl;
    this.updatedAt = new Date();
  }
}
export const PREDEFINED_REWARDS: Reward[] = [
  new Reward(
      '1',
      "Playlist d'Entraînement Exclusive",
      "Accès à une playlist exclusive de musique motivante pour vos entraînements.",
      'tier1',
      1,
      '/images/rewards/playlist.jpg',
      new Date(),
      new Date()
  ),
  new Reward(
      '2',
      'Massage Relaxant de 30 Minutes',
      "Profitez d'un massage relaxant de 30 minutes pour récupérer après vos entraînements.",
      'tier2',
      2,
      '/images/rewards/massage.jpg',
      new Date(),
      new Date()
  ),
  new Reward(
      '3',
      'Repas au Restaurant Gastronomique',
      "Un repas dans un restaurant gastronomique pour célébrer vos réussites sportives.",
      'tier3',
      5,
      '/images/rewards/restaurant.jpg',
      new Date(),
      new Date()
  ),
  new Reward(
      '4',
      'Escapade Weekend Surprise',
      "Une escapade weekend surprise pour vous détendre et vous ressourcer.",
      'tier4',
      10,
      '/images/rewards/weekend.jpg',
      new Date(),
      new Date()
  ),
  new Reward(
      '5',
      'Vacances Exotiques',
      "Des vacances dans un lieu exotique comme récompense ultime pour votre dévouement.",
      'tier5',
      15,
      '/images/rewards/vacation.jpg',
      new Date(),
      new Date()
  )
];