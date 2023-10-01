import {CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from "constructs";
import {
    AmazonLinuxGeneration,
    AmazonLinuxImage,
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    IVpc,
    Port,
    SubnetType
} from "aws-cdk-lib/aws-ec2";
import * as path from "path";
import * as fs from "fs";
import {generateID} from "../../utils/IDGenerator";
import {getExportName} from "../../utils/Utils";
import {config} from "../../utils/Config";

/*
    * This is a stack for Prometheus
    * It will create an EC2 instance with Prometheus installed
 */
interface PrometheusStackProps extends StackProps {
    vpc: IVpc,
}

export class PrometheusStack extends Stack {
    constructor(scope: Construct, id: string, props: PrometheusStackProps) {
        super(scope, id, props);

        const prometheusScriptPath = path.join(__dirname, '..', 'scripts', 'prometheus', 'prometheus-install.sh');
        const prometheusScriptData = fs.readFileSync(prometheusScriptPath, 'utf8');

        const ec2Instance = new Instance(this, generateID('prometheus-instance'), {
            vpc: props.vpc,
            instanceName: generateID('prometheus-instance'),
            keyName: config.monitoring.prometheus?.key,
            instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
            vpcSubnets: {
                subnetType: SubnetType.PUBLIC,
            },
            machineImage: new AmazonLinuxImage({
                generation: AmazonLinuxGeneration.AMAZON_LINUX_2
            }),
        });

        ec2Instance.connections.allowFromAnyIpv4(Port.tcp(9090), 'Allow Prometheus Access');

        ec2Instance.addUserData(prometheusScriptData);

        new CfnOutput(this, generateID('prometheusIp'), {
            value: ec2Instance.instancePublicIp,
            description: 'Prometheus IP',
            exportName: getExportName('prometheusIp'),
        });
    }
}
