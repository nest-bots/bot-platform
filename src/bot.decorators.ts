import {Inject, SetMetadata, Type} from "@nestjs/common";
import {BotCommandHandler, BotInstance} from "./bot.interfaces";
import {
    BOT_CLIENT,
    BOT_COMMAND_ALIAS, BOT_COMMAND_ID,
    BOT_COMMAND_NAME,
    BOT_COMMAND_PARENT,
    BOT_EVENT,
    BOT_INSTANCE
} from "./bot.constants";
import * as uuid from 'uuid/v4';

export const Bot = () => SetMetadata(BOT_COMMAND_ID, uuid());

Bot.InjectClient = () => Inject(BOT_CLIENT);
Bot.InjectInstance = () => Inject(BOT_INSTANCE);

Bot.Event = <T extends BotInstance>(type: Type<T>, event: T['events']) => SetMetadata(BOT_EVENT, event);

Bot.Command = (name: string) => SetMetadata(BOT_COMMAND_NAME, name);
Bot.CommandAlias = (...alias: string[]) => SetMetadata(BOT_COMMAND_ALIAS, alias);

Bot.CommandParent = <V extends BotInstance, T extends BotCommandHandler<V>>(parent: Type<T>) => SetMetadata(BOT_COMMAND_PARENT, parent);
