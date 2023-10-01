import jsonConfig from '../config/config.json';

export const config = {
    app: {
        name: jsonConfig.app.name,
        environment: jsonConfig.app.environment,
    }
}

