import { Task, TaskId } from '../types';

export class WorkflowGraph {
  private tasks: Map<TaskId, Task> = new Map();

  public addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  public getTask(id: TaskId): Task | undefined {
    return this.tasks.get(id);
  }

  public getExecutableTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(task =>
      task.status === 'pending' &&
      task.dependencies.every(depId => {
        const dep = this.tasks.get(depId);
        // A task is executable if all dependencies are finished (completed OR failed)
        return dep && (dep.status === 'completed' || dep.status === 'failed');
      })
    );
  }

  public updateTaskStatus(id: TaskId, status: Task['status'], result?: any): void {
    const task = this.tasks.get(id);
    if (task) {
      task.status = status;
      task.result = result;
    }
  }
}
