require("module-alias/register");
import i18n = require('i18n');
import { Client } from 'discord.js';
import { CommandRegistry, Configuration, ModuleRegistry, Container, SERVICE_IDENTIFIERS } from 'api';
import { CommandRegistryBase, ConfigurationBase, ModuleRegistryBase } from 'core';

i18n.configure({
    locales: ['en'],
    fallbacks: {'*': 'en'},
    directory: `${__dirname}/locale`,
    logDebugFn: (msg) => console.debug(msg),
    logWarnFn: (msg) => console.warn(msg),
    logErrorFn: (msg) => console.error(msg)
});
i18n.setLocale('en');

// Set Up Dependencies
Container.bind<CommandRegistry>(SERVICE_IDENTIFIERS.COMMAND_REGISTRY).to(CommandRegistryBase).inSingletonScope();
Container.bind<Configuration>(SERVICE_IDENTIFIERS.CONFIGURATION).to(ConfigurationBase).inSingletonScope();
Container.bind<ModuleRegistry>(SERVICE_IDENTIFIERS.MODULE_REGISTRY).to(ModuleRegistryBase).inSingletonScope();

var client = new Client();
var commandRegistry = Container.get<CommandRegistry>(SERVICE_IDENTIFIERS.COMMAND_REGISTRY);
var moduleRegistry = Container.get<ModuleRegistry>(SERVICE_IDENTIFIERS.MODULE_REGISTRY);
var configuration = Container.get<Configuration>(SERVICE_IDENTIFIERS.CONFIGURATION);

moduleRegistry.loadModules()
    .then(modules => moduleRegistry.preInitializeModules(modules))
    .then(modules => moduleRegistry.initializeModules(client, modules))
    .then(modules => {
        client.login(configuration.token);
        return Promise.resolve(modules);
    })
    .then(modules => moduleRegistry.postInitializeModules(client, modules))
    .catch(reason => console.error(reason))
    .finally(async () => {
        console.log("Service Started");
    });