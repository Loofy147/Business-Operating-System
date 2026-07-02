export class MetricsCollector {
  private metrics: any[] = [];

  public recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now()
    });
    console.log(`Metric Recorded: ${name}=${value}`, labels);
  }

  public getMetrics(): any[] {
    return this.metrics;
  }
}

export const globalMetrics = new MetricsCollector();
