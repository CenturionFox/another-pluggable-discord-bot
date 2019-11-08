import { Command } from 'api';

/**
 * Holds a registry of each command object by name.  This interface supports
 * inversion via `api/inversion/container`.
 * @author satyrnidae🌙🦋
 * @since 0.0.1a
 */
export default interface CommandRegistry {

    readonly registry: Command[];

    register(command: Command, moduleId: string | symbol): boolean;

    get(command: string, moduleId: string | symbol): Command[];

    getAll(moduleId?: string | symbol): Command[];
}