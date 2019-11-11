import { CommandRegistry } from "api/entity";
import { Module } from "api/modules";
import { Client } from "discord.js";

export default interface ModuleRegistry {

    loadModules(): Promise<void>;

    preInitializeModules(client: Client): Promise<void>;

    initializeModules(client: Client): Promise<void>;

    postInitializeModules(client: Client): Promise<void>;
}