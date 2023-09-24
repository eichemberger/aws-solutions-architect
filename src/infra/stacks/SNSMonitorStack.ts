import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Alarm, Metric, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { Construct } from 'constructs';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { join } from 'path';
import {Effect, PolicyStatement} from 'aws-cdk-lib/aws-iam';
export class MonitorStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const webHookLambda = new NodejsFunction(this, 'webHookLambda', {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..','..', 'lambda', 's3events', 'handler.ts')),
        });

        webHookLambda.addToRolePolicy(new PolicyStatement({
            actions: ['ssm:GetParameter'],
            resources: ['arn:aws:ssm:*:*:parameter/monitor/space-finder/slack-webhook'],
            effect: Effect.ALLOW
        }));

        const alarmTopic = new Topic(this, 'AlarmTopic', {
            displayName: 'AlarmTopic',
            topicName: 'AlarmTopic'
        });

        alarmTopic.addSubscription(new LambdaSubscription(webHookLambda));
        const topicAction = new SnsAction(alarmTopic);

    }
}