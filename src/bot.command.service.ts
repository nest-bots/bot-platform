import {Injectable, Type} from "@nestjs/common";
import {Bot} from "./bot.decorators";
import {BotCommandHandler, BotInstance} from "./bot.interfaces";
import {DiscoveredClass} from "@nestjs-plus/discovery";
import {CommandMeta, CommandResult, TreeNode} from "./bot.types";
import {BOT_COMMAND_ALIAS, BOT_COMMAND_ID, BOT_COMMAND_NAME, BOT_COMMAND_PARENT} from "./bot.constants";
import * as Tree from 'data-tree';

@Injectable()
export class BotCommandService {

    public readonly CommandTree = Tree.create();

    constructor(
        @Bot.InjectInstance()
        instance: BotInstance,
    ) {
        this.CommandTree.insert({
            id: '00000000-0000-0000-0000-000000000000',
            name: 'root',
            alias: false,
            instance: null,
        });
    }

    public findCommand(path: string[]): CommandResult {
        let node: TreeNode<CommandMeta> = this.CommandTree.rootNode();

        this.findNode(node, path[0]);

        let i = 0;
        for(let name of path) {
            const foundNode: TreeNode<CommandMeta> | null = this.findNode(node, name);

            if(foundNode) {
                node = foundNode;
                i++;
            }
        }

        return node._data.id === this.CommandTree.rootNode().id ? null : {
            instance: node._data.instance,
            element: i,
            args: path.slice(i),
        };
    }

    private findNode(currentNode: TreeNode<CommandMeta>, name: string): TreeNode<CommandMeta> | null {
        for(let node of currentNode._childNodes)
            if(node._data.name === name.toLowerCase())
                return node;

        return null;
    }

    public exportCommandTree(): object {
        return this.CommandTree['export'](data => ({
            id: data.id,
            name: data.name,
            alias: data.alias
        }));
    }

    public getCommandParent(clazz: DiscoveredClass): string | null {
        const {injectType} = clazz;

        if(Reflect.hasMetadata(BOT_COMMAND_PARENT, injectType)) {
            const parentClass: Type<BotCommandHandler<any>> = Reflect.getMetadata(BOT_COMMAND_PARENT, injectType);

            return Reflect.getMetadata(BOT_COMMAND_ID, parentClass);
        }

        return null;
    }

    public getCommandMeta(id: string, commandClass: DiscoveredClass): CommandMeta[] {
        let name: string;
        let aliases: string[] = [];
        let parent: string;

        const {injectType, instance} = commandClass;

        if(Reflect.hasMetadata(BOT_COMMAND_NAME, injectType))
            name = Reflect.getMetadata(BOT_COMMAND_NAME, injectType);

        if(!name || /^\s*$/.test(name))
            throw new Error(`Missing command name for ${id}`);

        if(/\s/.test(name))
            throw new Error(`Command names can't contain spaces (${id})`);

        if(Reflect.hasMetadata(BOT_COMMAND_ALIAS, injectType))
            aliases = Reflect.getMetadata(BOT_COMMAND_ALIAS, injectType);

        return [{
            id,
            name: name.toLowerCase(),
            instance: instance as any,
            alias: false,
        }].concat(aliases.map(alias => ({
            id,
            name: alias.toLowerCase(),
            instance: instance as any,
            alias: true,
        })));
    }

}
