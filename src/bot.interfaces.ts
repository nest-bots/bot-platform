export abstract class BotInstance  {

    abstract readonly name: string;
    abstract readonly config: any;
    abstract readonly events: typeof Dummy;

    abstract client: any;

    abstract createClient(config: typeof BotInstance.prototype.config): void;
    abstract initClient(): void | Promise<void>;

    abstract registerEvent(name: string, handler: Function): void | Promise<void>;

}

enum Dummy {}

export interface BotEventHandler<T extends BotInstance> {

    handle(client: T['client'], ...args: any[])

}

export abstract class BotCommandHandler<T extends BotInstance> {

    abstract handle(client: T['client'], ...args: any[]): void | Promise<void>

}
