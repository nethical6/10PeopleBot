import { Collection } from 'discord.js';
import { Command } from '../types/command';
import { voteKickCommand } from './votekick';
import { kickMeComamnd } from './kickme';

export class CommandHandler {
    private commands: Collection<string, Command>;

    constructor() {
        this.commands = new Collection();
        this.registerCommands();
    }

    private registerCommands() {
        const commandList = [
            voteKickCommand,
            kickMeComamnd
        ];

        for (const command of commandList) {
            this.commands.set(command.data.name, command);
        }
    }

    getCommands(): Command[] {
        return Array.from(this.commands.values());
    }

    getCommand(name: string): Command | undefined {
        return this.commands.get(name);
    }
}