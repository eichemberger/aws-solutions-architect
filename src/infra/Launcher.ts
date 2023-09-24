import { App } from 'aws-cdk-lib';
import {S3NotificationsStack} from "./stacks/S3NotificationsStack";
import {DynamoDBStreamLambdaStack} from "./stacks/DynamoDBStreamLambdaStack";

const app = new App(); 

// new S3NotificationsStack(app, 'S3Stack');

new DynamoDBStreamLambdaStack(app, 'DynamoDBStreamLambdaStack');