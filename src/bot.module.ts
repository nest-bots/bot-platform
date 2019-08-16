import {DynamicModule, Logger, Module, OnModuleInit, Provider, Type} from "@nestjs/common";
import {AsyncBotOptions, BotOptionsFactory} from "./bot.options";
import {BOT_CLIENT, BOT_COMMAND_ID, BOT_EVENT, BOT_INSTANCE, BOT_OPTIONS} from "./bot.constants";
import {DiscoveryModule, DiscoveryService} from "@nestjs-plus/discovery";
import {BotEventHandler, BotInstance} from "./bot.interfaces";
import {ModuleRef} from "@nestjs/core";
import {CommandMeta, TreeNode} from "./bot.types";
import {BotCommandService} from "./bot.command.service";

@Module({
    imports: [DiscoveryModule],
    providers: [BotCommandService],
    exports: [BotCommandService],
})
export class BotModule implements OnModuleInit {

    static forRoot<T extends BotInstance>(type: Type<T>, config: T['config']): DynamicModule {
        const instance: T = new type();

        instance.createClient(config);

        const providers: Provider[] = [{
            provide: BOT_OPTIONS,
            useValue: config || {},
        }, {
            provide: BOT_CLIENT,
            useFactory: () => instance.client,
        }, {
            provide: BOT_INSTANCE,
            useValue: instance,
        }];

        return {
            module: BotModule,
            providers,
            exports: providers,
        };
    }

    static forRootAsync<T extends BotInstance>(type: Type<T>, config: AsyncBotOptions<T['config']>): DynamicModule {
        const instance: T = new type();

        instance.createClient(config);

        return {
            module: BotModule,
            imports: config.imports || [],
            providers: this.createAsyncProvider(type, config).concat([{
                    provide: BOT_CLIENT,
                    useFactory: () => instance.client,
                }, {
                    provide: BOT_INSTANCE,
                    useValue: instance,
            }]),
        };
    }

    private static createAsyncProvider<T extends BotInstance>(type: Type<T>, options: AsyncBotOptions<T['config']>): Provider[] {
        return [
            this.createAsyncOptionsProvider(type, options),
            options.useExisting || options.useFactory ? {
                provide: options.useClass,
                useClass: options.useClass,
            } : undefined,
        ];
    }

    private static createAsyncOptionsProvider<T extends BotInstance>(type: Type<T>, options: AsyncBotOptions<T['config']>): Provider {
        let factory: (...args: any[]) => T['config'] | Promise<T['config']>;
        let inject;

        if(options.useFactory) {
            factory = options.useFactory;
            inject = options.inject || [];
        } else {
            factory = async (optionsFactory: BotOptionsFactory<T['config']>) => await optionsFactory.createBotOptions();
            inject = [options.useExisting || options.useClass];
        }

        return {
            provide: BOT_OPTIONS,
            useFactory: factory,
            inject,
        };
    }

    constructor(
        private readonly ref: ModuleRef,
        private readonly discover: DiscoveryService,
        private readonly commandService: BotCommandService,
    ) {}

    private readonly logger = new Logger('BotLoader', true);

    async onModuleInit() {
        const bot = this.ref.get<string, BotInstance>(BOT_INSTANCE);

        await this.initializeEvents(bot);
        await this.initializeCommands();

        await bot.initClient();
    }

    async initializeCommands() {
        const Commands = await this.discover.providersWithMetaAtKey<string>(BOT_COMMAND_ID);

        for(let command of Commands) {
            const id: string = command.meta;

            const commandMeta: CommandMeta[] = this.commandService.getCommandMeta(id, command.discoveredClass);

            const parentId: string = this.commandService.getCommandParent(command.discoveredClass);

            const parentNodes: TreeNode<CommandMeta>[] = [];

            if(parentId) {
                const parentNode: TreeNode<CommandMeta> = this.commandService.CommandTree.traverser().searchBFS(data => data.id === parentId);

                if(!parentNode)
                    throw new Error('Child node has to be registered after parent');

                parentNodes.push(parentNode, ...parentNode.siblings());
            } else
                parentNodes.push(this.commandService.CommandTree.rootNode());

            parentNodes.forEach(parentNode =>
                commandMeta.forEach(meta => this.commandService.CommandTree.insertToNode(parentNode, meta))
            );
        }
        console.log(JSON.stringify(this.commandService.exportCommandTree(), null, 4));
    }

    async initializeEvents(bot: BotInstance) {
        const Events = await this.discover.providersWithMetaAtKey<string>(BOT_EVENT);

        for(let event of Events) {
            const eventName: string = event.meta;
            const eventClass: BotEventHandler<typeof bot> = event.discoveredClass.instance as any;

            this.logger.log(`Event '${eventName}' registered`);

            if(eventClass.handle)
                bot.registerEvent(eventName, (client, ...args: any[]) => eventClass.handle(client, ...args));
        }
    }

}


