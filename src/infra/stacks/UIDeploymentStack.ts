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
import {generateID} from "../../utils/IDGenerator";
import {getExportName} from "../../utils/Utils";
import {config} from "../../utils/Config";

export class UIDeploymentStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const hostedZoneId = config.route53.hostedZoneId;
        const zoneName = config.route53.domain;
        const prefixDomain = config.ui.prefixDomain;

        const uiBucket = new Bucket(this, generateID('UIBucket'), {
            bucketName: generateID('ui-bucket'),
        });

        const uiDirectory = path.join(__dirname, '..', '..', 's3UiBucket', 'dist');

        if (!existsSync(uiDirectory)) {
            console.warn(`UI directory does not exist: ${uiDirectory}`);
            return;
        }

        new BucketDeployment(this, generateID('bucketDeployment'), {
            destinationBucket: uiBucket,
            sources: [Source.asset(uiDirectory)],
        });

        const originIdentity = new OriginAccessIdentity(this, generateID('originIdentity'));

        uiBucket.grantRead(originIdentity);

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, generateID('hostedZone'), {
            hostedZoneId: hostedZoneId,
            zoneName: zoneName,
        });

        const certificate = new Certificate(this, generateID('certificate'), {
            domainName: `${prefixDomain}.${zoneName}`,
            validation: CertificateValidation.fromDns(hostedZone),
        });

        const distribution = new Distribution(this, generateID('originDistribution'), {
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

        new ARecord(this, generateID('ARecord'), {
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            zone: hostedZone,
            recordName: `${prefixDomain}.${zoneName}`,
        });

        new AaaaRecord(this, generateID('AaaaRecord'), {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
            recordName: `${prefixDomain}.${zoneName}`,
        });

        new CfnOutput(this, generateID('distributionDomainName'), {
            value: distribution.distributionDomainName,
            description: 'The domain name of the CloudFront distribution',
            exportName: getExportName('distributionDomainName'),
        });
    }
}