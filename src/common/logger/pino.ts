
import pino, { LoggerOptions } from 'pino';
import { Logger } from './interface';
import { IMessagePublisher } from '../message-broker/rabbitmq/publisher/interface';
import { MessagePublisher } from '../message-broker/rabbitmq/publisher';
import { RabbitMQConnection } from '../message-broker/rabbitmq/connection';
export class PinoLogger implements Logger {
  private instance: pino.Logger;
  private publisher: IMessagePublisher
  constructor() {
    this.publisher = new MessagePublisher(RabbitMQConnection.getConnection());
    const pinoOptions: LoggerOptions = {
      transport: {
        target: 'pino-pretty',
      }
    };
    this.instance = pino(pinoOptions);
  }
  fatal(obj: any, msg?: string, ...args: any[]) {
    this.instance.fatal(obj, msg, ...args);
  }
  error(obj: any, msg?: string, ...args: any[]) {
    this.instance.error(obj, msg, ...args);
    this.publisher.publish('exchange.error', 'route.error', {
      message: msg,
      data: obj.message
    });
  }
  info(obj: any, msg?: string, ...args: any[]) {
    this.instance.info(obj, msg, ...args);
  }
  debug(obj: any, msg?: string, ...args: any[]) {
    this.instance.debug(obj, msg, ...args);
  }
  trace(obj: any, msg?: string, ...args: any[]) {
    this.instance.trace(obj, msg, ...args);
  }
  silent(obj: any, msg?: string, ...args: any[]) {
    this.instance.silent(obj, msg, ...args);
  }
  warn(obj: any, msg?: string, ...args: any[]) {
    this.instance.warn(obj, msg, ...args);
  }
}
