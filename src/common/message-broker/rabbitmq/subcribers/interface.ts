type HandlerCallback<T> = (message: T) => Promise<void>;
export interface MessageSubcriber {
    subcribe<T>(options: {
        exchange: string, queue: string, routingKey: string
    }, handler: HandlerCallback<T>, numberOfTask?: number): this;
}
