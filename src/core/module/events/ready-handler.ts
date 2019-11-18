import i18n = require('i18n');
import { EventHandler, forEachAsync, lazyInject } from 'api'
import { Client, Guild } from 'discord.js'
import { MessageService } from 'core';

export default class ReadyHandler extends EventHandler {
    event: string = 'ready';

    @lazyInject('CoreMessageService')
    messageService: MessageService;

    public async handler(client: Client, ..._args: any[]): Promise<any> {
        client.on('error', (e: string) => console.error(e))
        client.on('warn', (w: string) => console.warn(w))
        client.on('info', (i: string) => console.info(i))

        console.log(`${i18n.__('Logged in as ')}${client.user.tag}${i18n.__(', and ready for service!')}`)

        return await forEachAsync(client.guilds.array(), async (guild: Guild): Promise<any> => {
            return await this.messageService.sendGuildWelcomeMessage(guild);
        });
    }
}
