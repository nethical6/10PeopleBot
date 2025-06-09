import { 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle, 
    Message} from 'discord.js';
import { Bot } from '../bot';
import { INTEREST_OPTIONS } from '../constants';

export const MessageCreateHandler = async (message: Message, bot: Bot) => {
    if(message.content.startsWith('!start')) {
        if (message.author.id !== bot.guild?.ownerId) {
            return;
        }
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`interest_menu`)
            .setPlaceholder('Select your interests (up to 5)')
            .setMinValues(1)
            .setMaxValues(5)
            .addOptions(INTEREST_OPTIONS.map(opt => ({ label: opt.label, value: opt.value })));

        const confirmButton = new ButtonBuilder()
            .setCustomId(`join_button`)
            .setLabel('✅ Find a Group')
            .setStyle(ButtonStyle.Success);

        const row1 = new ActionRowBuilder().addComponents(selectMenu);
        const row2 = new ActionRowBuilder().addComponents(confirmButton);

        // fetch the channel
        const channel = await bot.client.channels.fetch(message.channelId);
        if(channel?.isTextBased() && channel.isSendable()) {
            await channel.send({
            content: '👋 Pick your interests and hit confirm to find a group:\n',
            components: [row1.toJSON(), row2.toJSON()]
        });
        }
    }
    
};