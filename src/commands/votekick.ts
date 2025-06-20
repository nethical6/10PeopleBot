import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../bot';
import { group } from 'console';

export const voteKickCommand = {
    data: new SlashCommandBuilder()
        .setName('votekick')
        .setDescription('Kick out a user from channel via vote')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to kick out')
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, bot: Bot) => {
        if (!interaction.channel) {
            await interaction.reply({ content: 'This command can only be used in a channel!', ephemeral: true });
            return;
        }

        const target = interaction.options.getUser('user');
        if (!target) {
            await interaction.reply({ content: 'User not found.', ephemeral: true });
            return;
        }
        if(!await bot.db.checkIfUserIsFromGroup(interaction.channelId,target.id)){
            await interaction.reply({ content: 'User not found in group.', ephemeral: true });
            return;
        }

        const allMembers = await bot.db.getAllGroupMembers(interaction.channelId)
        if (!Array.isArray(allMembers)) {
            await interaction.reply({ content: 'Failed to create vote kick', ephemeral: true });
            return;
        }

        const totalMembers = allMembers.length -1 ;
        const votesNeeded = Math.ceil(totalMembers * 0.8);
        const voteEmbed = new EmbedBuilder()
            .setTitle('🗳️ Vote Kick')
            .setDescription(`Vote to kick ${target.toString()}`)
            .addFields(
                { name: 'Initiated by', value: interaction.user.toString() },
                { name: 'Votes needed', value: `${votesNeeded}` },
                { name: 'Time remaining', value: '30 seconds' }
            )
            .setFooter({ text: `Voters: 0` })
            .setTimestamp();

        // Create buttons
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`vote_yes:${target.id}:${Date.now()}`)
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`vote_no:${target.id}:${Date.now()}`)
                    .setLabel('No')
                    .setStyle(ButtonStyle.Secondary)
            );

        const response = await interaction.reply({ 
            embeds: [voteEmbed], 
            components: [row],
            withResponse: true // Changed from withResponse to fetchReply
        });
        if (!response.resource || !response.resource.message) return
        // Create collector for vote buttons
        const collector = response.resource.message.createMessageComponentCollector({ 
            componentType: ComponentType.Button,
            time: 30_000
        });
    

        const votes = new Set();

        collector.on('collect', async i => {
            // Prevent target from voting
            if (i.user.id === target.id) {
                return;
            }

            // Handle vote
            if (i.customId.startsWith('vote_yes')) {
                votes.add(i.user.id);
            } else {
                votes.delete(i.user.id);
            }

            // Update embed
            const newEmbed = EmbedBuilder.from(voteEmbed)
                .setFooter({ text: `Voters: ${Array.from(votes).length}` });

            await i.update({ embeds: [newEmbed] });

            if (votes.size >= votesNeeded) {
                collector.stop('success');
            }
        });

        collector.on('end', async (collected, reason) => {
            // Remove buttons
            const disabledRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('vote_yes_disabled')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('vote_no_disabled')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );

            // If vote passed, kick the user
            if (reason === 'success') {
                try {
                    const member = await interaction.guild?.members.fetch(target.id);
                    if (member && interaction.channel?.type == ChannelType.GuildText) {
                        
                        const kickEmbed = EmbedBuilder.from(voteEmbed)
                            .setTitle(`🗳️ ${target.toString()} was kicked through voting`)
                            .setFooter({ text: `Final votes: ${votes.size}` })
                            .setColor("#FF5555") 
                            .setTimestamp();
                        
                        await response.resource?.message?.edit({ 
                            embeds: [kickEmbed],
                            components: [disabledRow]
                        });
                        await member.send({embeds: [kickEmbed]});
                        
                        await bot.db.removeMemberFromGroup(member)
                         await interaction.channel.permissionOverwrites.edit(member.id, {
                            ViewChannel: false,
                            SendMessages: false,
                        });
                    }
                } catch (error) {
                    console.error('Failed to kick member:', error);
                }
            }else{
                const fail = EmbedBuilder.from(voteEmbed)
                    .setTitle(`🗳️ Not enough votes to kick ${target.toString()}`)
                    .setFooter({ text: `Final votes: ${votes.size}` })
                    .setColor("#FF5555") 
                    .setTimestamp();
                await response.resource?.message?.edit({ 
                    embeds: [fail],
                    components: [disabledRow]
                });
            }
        });
    }
};