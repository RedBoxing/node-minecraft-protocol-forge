import { Client } from 'minecraft-protocol'

declare module 'minecraft-protocol-forge' {
    export interface HandshakeOptions {
        forgeMods: Array<string>,
        autoMods: boolean
    }

    export function forgeHandshake(client : Client, options : HandshakeOptions) : void;
    export function autoVersionForge(client : Client, options : HandshakeOptions) : void;
}