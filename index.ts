#! /usr/bin/env node

import packageJson from './package.json';
import { getConfig } from './src/util/config';
import { MessageType, statusMessage } from "./src/util/console";
import AdmZip from 'adm-zip';
import path from 'path';

async function main(): Promise<void> {
    // Needed for exit handler
    process.stdin.resume();
    const startTime = Date.now();

    statusMessage(MessageType.Info, `Starting ${packageJson.name} v${packageJson.version}...`);

    const config = await getConfig();
    const inputAssetsZip = new AdmZip(config.inputJavaPack!);

    

    inputAssetsZip.writeZip(path.join(process.cwd(), 'target', 'output.zip'));

    const completionTime = (Date.now() - startTime) / 1000;
    statusMessage(MessageType.Completion, `Optimization complete in ${completionTime}s`);

    process.exit(0);
}

main();