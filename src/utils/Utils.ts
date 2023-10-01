import {config} from "./Config";

export const getExportName = (name: string) => {
    return `${config.app.name}:${name}:${config.app.environment}`;
}