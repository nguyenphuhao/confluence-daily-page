import { Channel } from 'amqplib';
import { ChannelWrapper } from 'amqp-connection-manager';
import { MessageSubcriber } from './interface';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
export class DirectSubcriber implements MessageSubcriber {
  private channelWrapper: ChannelWrapper;
  constructor(connection: IAmqpConnectionManager) {
    this.channelWrapper = connection.createChannel();
  }
  subcribe<T>(options: {
    exchange: string, queue: string, routingKey: string
  }, onMessage: (message: T) => Promise<void>, numberOfTask?: number) {
    const { exchange, queue, routingKey } = options;
    this.channelWrapper.addSetup(function (channel: Channel) {
      channel.prefetch(numberOfTask || 1);
      channel.assertExchange(exchange, 'direct', { durable: true });
      channel.assertQueue(queue, { durable: true });
      channel.bindQueue(queue, exchange, routingKey);
      channel.consume(queue, async (data) => {
        try {
          if (!data) {
            return;
          }
          const message = JSON.parse(data.content?.toString());
          await onMessage(message);
          channel.ack(data);
        } catch (error) {
          channel.nack(data!, false, true);
          throw error;
        }
      }, {
        noAck: false
      });
    });
    return this;
  }
}
