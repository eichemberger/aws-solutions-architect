import {CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {randomUUID} from 'crypto';
import {IpAddresses, IVpc, Vpc} from "aws-cdk-lib/aws-ec2";

/*
    * This stack creates a vpc
*/
export class VPCStack extends Stack {

    public vpc: IVpc;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = randomUUID();

        this.vpc = new Vpc(this, `vpc-${suffix}`, {
            vpcName: `vpc-${suffix}`,
            ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
            natGateways: 0,
        });

        new CfnOutput(this, 'vpcId', {
            value: this.vpc.vpcId,
            description: 'VPC ID',
            exportName: 'vpc:id'
        })
    }
}