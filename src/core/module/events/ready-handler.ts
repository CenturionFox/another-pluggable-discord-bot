import * as i18n from 'i18n';
import { Guild } from 'discord.js';
import { MessageService, CoreModuleServiceIdentifiers } from 'core/module/services';
import { EventHandler } from 'api/module';
import { lazyInject } from 'api/inversion';
import { ServiceIdentifiers, ClientService, EventService } from 'api/services';
import { forEachAsync } from 'api/utils';

export default class ReadyHandler extends EventHandler {
    event = 'ready';

    @lazyInject(CoreModuleServiceIdentifiers.Message)
    messageService: MessageService;

    @lazyInject(ServiceIdentifiers.Client)
    clientService: ClientService;

    @lazyInject(ServiceIdentifiers.Event)
    eventService: EventService;

    public async handler(): Promise<any> {
        this.eventService.on('error', (e: string) => console.info(e));
        this.eventService.on('warn', (w: string) => console.info(w));
        this.eventService.on('info', (i: string) => console.info(i));

        console.info(i18n.__('Logged in as %s, and ready for service!', this.clientService.userTag));

        return forEachAsync(this.clientService.guilds, async (guild: Guild): Promise<any> => this.messageService.sendGuildWelcomeMessage(guild));
    }
}
