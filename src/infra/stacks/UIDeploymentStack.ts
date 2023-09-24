import {CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket} from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import {existsSync} from 'node:fs';
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment';
import {Distribution, OriginAccessIdentity} from 'aws-cdk-lib/aws-cloudfront';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins';
import {randomUUID} from "crypto";

export class UIDeploymentStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const suffix = randomUUID();

        const uiBucket = new Bucket(this, `UIBucket-${suffix}`, {
            bucketName: `ui-deployment-bucket-${suffix}`,
        });

        const uiDirectory = path.join(__dirname, '..', '..', 's3UiBucket', 'dist');

        if (!existsSync(uiDirectory)) {
            console.warn(`UI directory does not exist: ${uiDirectory}`);
            return;
        }

        new BucketDeployment(this, 'UIDeploymentBucket', {
            destinationBucket: uiBucket,
            sources: [Source.asset(uiDirectory)],
        });

        const originIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');

        uiBucket.grantRead(originIdentity);

        const distribution = new Distribution(this, 'OriginDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: new S3Origin(uiBucket, {
                    originAccessIdentity: originIdentity,
                })
            }
        });

        new CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName
        });
    }
}