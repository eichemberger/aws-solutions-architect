import {CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket} from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import {existsSync} from 'node:fs';
import {BucketDeployment, Source} from 'aws-cdk-lib/aws-s3-deployment';
import {
    Distribution,
    HttpVersion,
    OriginAccessIdentity,
    SecurityPolicyProtocol,
    ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import {S3Origin} from 'aws-cdk-lib/aws-cloudfront-origins';
import {AaaaRecord, ARecord, HostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import {Certificate, CertificateValidation} from "aws-cdk-lib/aws-certificatemanager";
import 'dotenv/config';

export class UIDeploymentStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const hostedZoneId = process.env.HOSTED_ZONE_ID!;
        const zoneName = process.env.ZONE_NAME!;
        const prefixDomain = process.env.PREFIX_DOMAIN!;

        const suffix = 'ui-deployment-asjkd3';

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

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
            hostedZoneId: hostedZoneId,
            zoneName: zoneName,
        });

        const certificate = new Certificate(this, 'Certificate', {
            domainName: `${prefixDomain}.${zoneName}`,
            validation: CertificateValidation.fromDns(hostedZone),
        });

        const distribution = new Distribution(this, 'OriginDistribution', {
            defaultRootObject: 'index.html',
            defaultBehavior: {
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                origin: new S3Origin(uiBucket, {
                    originAccessIdentity: originIdentity,
                }),
            },
            domainNames: [`${prefixDomain}.${zoneName}`],
            certificate: certificate,
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            httpVersion: HttpVersion.HTTP2_AND_3,
        });

        new ARecord(this, `ARecord-${suffix}`, {
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            zone: hostedZone,
            recordName: `${prefixDomain}.${zoneName}`,
        });

        new AaaaRecord(this, `AaaaRecord-${suffix}`, {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            recordName: `${prefixDomain}.${zoneName}`,
        });

        new CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
        });
    }
}