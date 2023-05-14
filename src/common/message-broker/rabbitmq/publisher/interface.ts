export interface IMessagePublisher {
    publish<T>(exchange: string, routingKey: string, message: T): Promise<boolean>;
}
