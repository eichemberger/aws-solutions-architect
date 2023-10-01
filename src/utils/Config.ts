import jsonConfig from '../config/config.json';

export const config = {
    app: {
        name: jsonConfig.app.name,
        environment: jsonConfig.app.environment,
    },
    route53: {
        hostedZoneId: jsonConfig.route53.hostedZoneId,
        domain: jsonConfig.route53.domain,
    },
    ui: {
        prefixDomain: jsonConfig.ui.subdomain,
    },
    monitoring: {
        prometheus: {
            key: jsonConfig.monitoring.prometheus?.key,
        }
    }
}

