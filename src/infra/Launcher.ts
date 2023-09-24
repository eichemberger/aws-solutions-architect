import { App } from 'aws-cdk-lib';
import {S3NotificationsStack} from "./stacks/S3NotificationsStack";
import {DynamoDBStreamLambdaStack} from "./stacks/DynamoDBStreamLambdaStack";
import {UIDeploymentStack} from "./stacks/UIDeploymentStack";

const app = new App(); 

// new S3NotificationsStack(app, 'S3Stack');

// new DynamoDBStreamLambdaStack(app, 'DynamoDBStreamLambdaStack');

new UIDeploymentStack(app, 'UIDeploymentStack');