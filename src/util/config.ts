import fs from 'fs';
import path from 'path';
import { MessageType, statusMessage } from './console';
import { select, confirm } from '@inquirer/prompts';
import * as files from './files';

export interface Config {
    inputJavaPack: string | null;
    processMesh: boolean;
    processUv: boolean;
}

const defaultConfig: Config = {
    inputJavaPack: null,
    processMesh: true,
    processUv: true
};

let cachedConfig: Config | null = null;

export async function getConfig(): Promise<Config> {
    if (cachedConfig) {
        return cachedConfig;
    }
    try {
        const config = await files.parseJsonFile<Config>(files.absolutePath('config.json'));
        cachedConfig = config;
        return config;
    } catch (err) {
        statusMessage(
            MessageType.Info, 
            "No config file found. Please provide the required config values",
            "Simply input the value and press enter to proceed to the next value",
            "If you need help, please visit https://github.com/Kas-tle/PackMesher",
            "Press Ctrl+C to cancel"
        );
        statusMessage(MessageType.Plain, "");
        const newConfig = await promptForConfig();
        await fs.promises.writeFile("config.json", JSON.stringify(newConfig, null, 4));
        cachedConfig = newConfig;
        return newConfig;
    }
};

async function promptForConfig(): Promise<Config> {
    function getExtFiles(dir: string, extensions: string[]): Promise<{value: string}[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    const zipFiles = files.filter(file => extensions.includes(path.extname(file))).map(file => ({ value: file }));
                    resolve(zipFiles);
                }
            });
        });
    }

    const zipFiles = await getExtFiles(process.cwd(), ['.zip']);

    if (!zipFiles.length) {
        throw new Error("No zip files found in current directory. Please provide a pack to remap.");
    }

    let inputJavaPack = zipFiles.length === 1 ? zipFiles[0].value : 
        await select({ 
            message: "Input Java Pack:",
            choices: zipFiles
        });
    let processMesh = true;
    let processUv = true;

    let confirmed = false;

    while (!confirmed) {
        statusMessage(
            MessageType.Plain, 
            `Input Java Pack: ${inputJavaPack}`,
            `Optimize Mesh: ${processMesh}`,
            `Optimize UVs: ${processUv}`,
            ''
        );

        confirmed = await confirm({ message: 'Are these settings correct:' });

        if (!confirmed) {
            const fieldToEdit = await select({
                message: 'Which field would you like to edit?',
                choices: [
                    { name: 'Input Java Pack', value: 'inputJavaPack' },
                    { name: 'Optimize Mesh', value: 'processMesh' },
                    { name: 'Optimize UVs', value: 'processUv' }
                ]
            });

            switch (fieldToEdit) {
                case 'inputJavaPack':
                    inputJavaPack = await select({ 
                        message: "Input Java Pack:",
                        choices: await getExtFiles(process.cwd(), ['.zip'])
                    });
                    break;
                case 'processMesh':
                    processMesh = await confirm({ message: "Optimize Mesh:", default: true });
                    break;
                case 'processUv':
                    processUv = await confirm({ message: "Optimize UVs:", default: true });
                    break;
                default:
                    throw new Error(`Unknown field ${fieldToEdit}`);
            }
        }
    }

    return {
        ...defaultConfig,
        inputJavaPack,
        processMesh,
        processUv
    };
}