import config from '../config/config.json';

export const generateID = (resource: string) => {
    return `${config.app.name}-${resource}-${config.app.environment}`;
};