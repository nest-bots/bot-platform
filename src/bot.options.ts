import { ModuleMetadata, Type } from "@nestjs/common/interfaces";

export interface BotOptionsFactory<T> {

    createBotOptions(): Promise<T> | T;

}

export interface AsyncBotOptions<T> extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<BotOptionsFactory<T>>;
    useClass?: Type<BotOptionsFactory<T>>;
    useFactory?: (
        ...args: any[]
    ) => Promise<T> | T;
    inject?: any[];
}
