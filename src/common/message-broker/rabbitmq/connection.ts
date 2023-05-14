import mqManager from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';

export class RabbitMQConnection {
  static connection: IAmqpConnectionManager;
  private constructor() {
    throw new Error('RabbitMQConnection is Singleton')
  }
  static getConnection() {
    if (!RabbitMQConnection.connection) {
      RabbitMQConnection.connection = mqManager.connect([process.env.MQ_URL || '']);
    }
    return RabbitMQConnection.connection;
  }
}
