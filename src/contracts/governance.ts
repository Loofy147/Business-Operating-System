import { Task, PolicyValidationResult, ExecutionResult } from '../types';

export interface IPolicyEngine {
  validateRequest(task: Task): PolicyValidationResult;
  preExecutionCheck(task: Task, context: any): PolicyValidationResult;
  postExecutionCheck(result: ExecutionResult, context: any): PolicyValidationResult;
}
