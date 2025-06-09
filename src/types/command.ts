import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Bot } from '../bot';

export interface Command {
    data: SlashCommandOptionsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction, bot: Bot) => Promise<void>;
}