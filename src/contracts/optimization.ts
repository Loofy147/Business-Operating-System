import { ModelConfig, ModelRequirements } from '../types';

export interface IModelOptimizer {
  optimize(requirements: ModelRequirements): ModelConfig;
}

export interface IOptimizer {
  optimize(input: any): any;
}
