import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sns from "aws-cdk-lib/aws-sns";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {LambdaSubscription} from "aws-cdk-lib/aws-sns-subscriptions";
import {Queue} from "aws-cdk-lib/aws-sqs";

/*
    * This stack creates an S3 bucket and configures it to send a notification
      when an object is created to:
      - SNS
      - SQS
      - Lambda function
 */
export class S3NotificationsStack extends Stack {

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = 's3stack-unique-identifier-134kdanf';

    const s3EventLambda = new NodejsFunction(this, `s3EventLambda-${suffix}`, {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: (join(__dirname, '..','..', 'lambda', 's3events', 'handler.ts')),
    });

    const s3Bucket = new s3.Bucket(this, `s3-bucket-${suffix}`, {});

    // SNS
    const topic = new sns.Topic(this, `Topic-${suffix}`);

    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.SnsDestination(topic));
    topic.addSubscription(new LambdaSubscription(s3EventLambda));

    // SQS
    const queue = new Queue(this, `Queue-${suffix}`);
    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED_PUT, new s3n.SqsDestination(queue));

    //Lambda
    s3Bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(s3EventLambda));
  }

}