export enum MetalType {
  GOLD = 'Gold',
  ROSE_GOLD = 'Rose Gold',
  SILVER = 'Silver',
  PLATINUM = 'Platinum'
}

export interface DesignState {
  letter1: string;
  letter2: string;
  metal: MetalType;
  font: string;
}

