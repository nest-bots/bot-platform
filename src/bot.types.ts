import {BotCommandHandler} from "./bot.interfaces";

export type CommandResult = {
    instance: BotCommandHandler<any>,
    args: string[],
    element: number,
}

export type CommandMeta = {
    id: string,
    name: string,
    instance: BotCommandHandler<any>,
    alias: boolean,
}

export type TreeNode<T> = {
    _parentNode: TreeNode<T> | null,
    _childNodes: TreeNode<T>[],
    _data: T,
    _depth: number,
    siblings: () => TreeNode<T>[],
}
