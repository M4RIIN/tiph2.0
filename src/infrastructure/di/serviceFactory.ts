import { v4 as uuidv4 } from 'uuid';
import { WorkoutType } from '@/domain/entities/WorkoutSession';

import { ManageProgramsUseCaseImpl } from '@/application/useCases/ManageProgramsUseCase';
import { ManageWorkoutSessionsUseCaseImpl } from '@/application/useCases/ManageWorkoutSessionsUseCase';
import { ManageRewardsUseCaseImpl } from '@/application/useCases/ManageRewardsUseCase';
import { ManageGoalsUseCaseImpl } from '@/application/useCases/ManageGoalsUseCase';
import { TrackPointsUseCaseImpl } from '@/application/useCases/TrackPointsUseCase';
import {ProgramRepository} from "@/domain/repositories/ProgramRepository";
import {WorkoutSessionRepository} from "@/domain/repositories/WorkoutSessionRepository";
import {RewardRepository} from "@/domain/repositories/RewardRepository";
import {UserRepository} from "@/domain/repositories/UserRepository";
import {UserRewardRepository} from "@/domain/repositories/UserRewardRepository";
import {GoalRepository} from "@/domain/repositories/GoalRepository";
import { FirebaseGoalRepository } from "@/infrastructure/repositories/firebase/FirebaseGoalRepository";
import { FirebaseProgramRepository } from "@/infrastructure/repositories/firebase/FirebaseProgramRepository";
import { FirebaseWorkoutSessionRepository } from "@/infrastructure/repositories/firebase/FirebaseWorkoutSessionRepository";
import { FirebaseRewardRepository } from "@/infrastructure/repositories/firebase/FirebaseRewardRepository";
import { FirebaseUserRepository } from "@/infrastructure/repositories/firebase/FirebaseUserRepository";
import { FirebaseUserRewardRepository } from "@/infrastructure/repositories/firebase/FirebaseUserRewardRepository";
import {PointsServiceImpl} from "@/domain/services/PointsService";
import {GoalServiceImpl} from "@/domain/services/GoalService";

// Simple ID generator
const idGenerator = {
  generate: () => uuidv4()
};

// Create repositories
const createRepositories = () => {
  const programRepository = new FirebaseProgramRepository();
  const workoutSessionRepository = new FirebaseWorkoutSessionRepository();
  const rewardRepository = new FirebaseRewardRepository();
  const userRepository = new FirebaseUserRepository();
  const userRewardRepository = new FirebaseUserRewardRepository();
  const goalRepository = new FirebaseGoalRepository();

  return {
    programRepository,
    workoutSessionRepository,
    rewardRepository,
    userRepository,
    userRewardRepository,
    goalRepository
  };
};

// Create use cases
const createUseCases = (repositories: ReturnType<typeof createRepositories>) => {
  const programsUseCase = new ManageProgramsUseCaseImpl(
    {
      findById: repositories.programRepository.getById.bind(repositories.programRepository),
      findByUserId: repositories.programRepository.getProgramsByUserId.bind(repositories.programRepository),
      findByUserIdAndType: async (userId: string, type: WorkoutType) => {
        const programs = await repositories.programRepository.getProgramsByUserId(userId);
        return programs.filter(p => p.type === type);
      },
      save: repositories.programRepository.save.bind(repositories.programRepository),
      delete: repositories.programRepository.delete.bind(repositories.programRepository)
    },
    idGenerator
  );

  const workoutSessionsUseCase = new ManageWorkoutSessionsUseCaseImpl(
      repositories.workoutSessionRepository,
      repositories.programRepository,
      idGenerator,
  )

  const rewardsUseCase = new ManageRewardsUseCaseImpl(
    repositories.rewardRepository,
    repositories.userRewardRepository,
    repositories.userRepository,
    idGenerator
  );

  const pointsService = new PointsServiceImpl(
      repositories.userRepository,
      repositories.workoutSessionRepository
  );

  const goalService = new GoalServiceImpl();

  const pointsUseCase = new TrackPointsUseCaseImpl(
      pointsService,
      goalService,
      repositories.userRepository,
      repositories.workoutSessionRepository,
      repositories.goalRepository,
      repositories.userRewardRepository
  );

  const goalsUseCase = new ManageGoalsUseCaseImpl(
      repositories.goalRepository,
      repositories.rewardRepository,
      idGenerator,
  )

  return {
    programsUseCase,
    workoutSessionsUseCase,
    rewardsUseCase,
    goalsUseCase,
    pointsUseCase
  };
};

// Export interfaces for the use cases
export interface Services {
  programRepository: ProgramRepository;
  workoutSessionRepository: WorkoutSessionRepository;
  rewardRepository: RewardRepository;
  userRepository: UserRepository;
  userRewardRepository: UserRewardRepository;
  goalRepository: GoalRepository;
  programsUseCase: ReturnType<typeof createUseCases>['programsUseCase'];
  workoutSessionsUseCase: ReturnType<typeof createUseCases>['workoutSessionsUseCase'];
  rewardsUseCase: ReturnType<typeof createUseCases>['rewardsUseCase'];
  goalsUseCase: ReturnType<typeof createUseCases>['goalsUseCase'];
  pointsUseCase: ReturnType<typeof createUseCases>['pointsUseCase'];
}

// Create all services
export const createServices = (): Services => {
  const repositories = createRepositories();
  const useCases = createUseCases(repositories);

  return {
    ...repositories,
    ...useCases
  };
};
