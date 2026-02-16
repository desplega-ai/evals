export interface Challenge {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

export interface ChallengeWrapperProps {
  challenge: Challenge;
  onComplete: () => void;
}
