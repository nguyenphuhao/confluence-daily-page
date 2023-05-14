import { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { IMessagePublisher } from './interface';
import toBufferMessage from '@/common/helpers/toBufferMessage';
export class MessagePublisher implements IMessagePublisher {
  private channelWrapper: ChannelWrapper;
  constructor(connection: IAmqpConnectionManager) {
    this.channelWrapper = connection.createChannel();
  }
  publish<T>(exchange: string, routingKey: string, message: T) {
    return this.channelWrapper.publish(exchange, routingKey, toBufferMessage(message), {
      persistent: true
    });
  }
}
