"use client";

import React, {createContext, ReactNode, useContext} from 'react';
import { Services, createServices } from './serviceFactory';

// Create a context for the services
const ServiceContext = createContext<Services | null>(null);

// Provider component
interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  // Create services once when the provider is mounted
  const [services] = React.useState<Services>(() => createServices());

  return (
    <ServiceContext.Provider value={services}>
      {children}
    </ServiceContext.Provider>
  );
};

// Custom hook to use the services
export const useServices = (): Services => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};

// Specialized hooks for specific use cases
export const useProgramsService = () => {
  const { programsUseCase } = useServices();
  return programsUseCase;
};

export const useWorkoutSessionsService = () => {
  const { workoutSessionsUseCase } = useServices();
  return workoutSessionsUseCase;
};

export const useRewardsService = () => {
  const { rewardsUseCase } = useServices();
  return rewardsUseCase;
};

export const useGoalsService = () => {
  const { goalsUseCase } = useServices();
  return goalsUseCase;
};

export const usePointsService = () => {
  const { pointsUseCase } = useServices();
  return pointsUseCase;
};
