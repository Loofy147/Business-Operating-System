export class Logger {
  public static log(level: 'info' | 'warn' | 'error', message: string, context: any = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
    console.log(JSON.stringify(logEntry));
  }

  public static info(message: string, context: any = {}): void {
    this.log('info', message, context);
  }

  public static warn(message: string, context: any = {}): void {
    this.log('warn', message, context);
  }

  public static error(message: string, context: any = {}): void {
    this.log('error', message, context);
  }
}
