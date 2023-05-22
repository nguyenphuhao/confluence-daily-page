export interface Logger {
  fatal(obj: any, msg?: string, ...args: any[]): void;
  error(obj: any, msg?: string, ...args: any[]): void;
  info(obj: any, msg?: string, ...args: any[]): void;
  debug(obj: any, msg?: string, ...args: any[]): void;
  trace(obj: any, msg?: string, ...args: any[]): void;
  silent(obj: any, msg?: string, ...args: any[]): void;
  warn(obj: any, msg?: string, ...args: any[]): void;
}
