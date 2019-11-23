import { EventHandler, lazyInject, ServiceIdentifiers, ClientService } from 'api';
import { Message, Guild, TextChannel, RichEmbed, User, PartialTextBasedChannelFields } from 'discord.js';
import { ModuleServiceIdentifiers, ModuleConfigurationService, MessageService } from 'modules/message-link-embed-module/services';

const GUILD_GROUP_ID = 1;
const CHANNEL_GROUP_ID = 2;
const MESSAGE_GROUP_ID = 3;

export default class LinkQuoteHandler implements EventHandler {
    event = 'message';

    @lazyInject(ServiceIdentifiers.Client)
    clientService: ClientService;

    @lazyInject(ModuleServiceIdentifiers.Configuration)
    moduleConfigurationService: ModuleConfigurationService;

    @lazyInject(ModuleServiceIdentifiers.Message)
    messageService: MessageService;

    async handler(requestMessage: Message): Promise<void> {
        const originalMessage: Message = await this.getOriginalMessage(requestMessage);

        if(!originalMessage) return;

        //TODO: linking preferences

        const resultMessages: Message[] = await this.messageService.sendLinkedMessage(requestMessage, originalMessage);

        if(resultMessages && requestMessage.deletable) {
            await requestMessage.delete();
        }
    }

    private async getOriginalMessage(requestMessage: Message): Promise<Message> {
        const me: User = this.clientService.client.user;
        const linkMatches: RegExpMatchArray = requestMessage.content.match(/^https:\/\/discordapp.com\/channels\/(.+)\/(\d+)\/(\d+)\/?$/);
        if(!linkMatches || requestMessage.author.bot) {
            return undefined;
        }
        const guildId: string = linkMatches[GUILD_GROUP_ID];
        const channelId: string = linkMatches[CHANNEL_GROUP_ID];
        const messageId: string = linkMatches[MESSAGE_GROUP_ID];
        const replyTargetChannel: PartialTextBasedChannelFields =
            await this.moduleConfigurationService.getSendLinkingErrorsToDMs() ? requestMessage.author : requestMessage.channel;

        let channel: TextChannel;

        if (guildId === '@me') {
            channel = this.clientService.client.channels.find(dmChannel => dmChannel.id === channelId) as TextChannel;
            if(!channel) {
                await this.messageService.sendDMInaccessibleMessage(replyTargetChannel);
                return undefined;
            }
        }
        else {
            const guild: Guild = this.clientService.client.guilds.get(guildId);
            if(!guild) {
                await this.messageService.sendGuildInaccessibleMessage(replyTargetChannel);
                return undefined;
            }
            channel = guild.channels.get(channelId) as TextChannel;
            if(!(channel && channel.permissionsFor(me).has(['READ_MESSAGES', 'READ_MESSAGE_HISTORY']))) {
                await this.messageService.sendChannelInaccessibleMessage(replyTargetChannel);
                return undefined;
            }
        }

        const originMessage: Message = await channel.fetchMessage(messageId);
        if(!originMessage) {
            await this.messageService.sendMessageNotFoundMessage(replyTargetChannel);
            return undefined;
        }

        return originMessage;
    }
}
