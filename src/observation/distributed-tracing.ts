export class DistributedTracing {
  public static startSpan(traceId: string, name: string): string {
    const spanId = Math.random().toString(36).substring(7);
    console.log(`[Tracing] Started span ${spanId} for trace ${traceId} (${name})`);
    return spanId;
  }

  public static endSpan(spanId: string): void {
    console.log(`[Tracing] Ended span ${spanId}`);
  }
}
