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
  textureIntensity: number;
  manualOffsetX?: number;
  manualOffsetY?: number;
  manualOffsetZ?: number;
}

export interface AiResponse {
  title: string;
  description: string;
  priceEstimate: string;
}