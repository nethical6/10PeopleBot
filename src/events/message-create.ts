import { 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle, 
    Message} from 'discord.js';
import { Bot } from '../bot';

export const INTEREST_OPTIONS = [
    { label: 'Anime & Fandom Culture', value: 'anime' },
    { label: 'Artificial Intelligence & Future Tech', value: 'ai' },
    { label: 'Fitness & Wellness', value: 'fitness' },
    { label: 'Books & Reading', value: 'books' },
    { label: 'Music & Audio', value: 'music' },
    { label: 'Gaming & Esports', value: 'gaming' },
    { label: 'Tech & Gadgets', value: 'tech' },
    { label: 'Movies & TV Shows', value: 'movies' },
    { label: 'Sports & Outdoor Activities', value: 'sports' },
    { label: 'Art & Design', value: 'art' },
    { label: 'Memes & Internet Culture', value: 'memes' },
    { label: 'Philosophy & Deep Talks', value: 'philosophy' }
];

export const MessageCreateHandler = async (message: Message, bot: Bot) => {
    if(message.content.startsWith('!start')) {
        
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

    await message.reply({
        content: '👋 Pick your interests and hit confirm to find a group:',
        components: [row1.toJSON(), row2.toJSON()]
    });
    }
};