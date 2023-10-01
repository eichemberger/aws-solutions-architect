import { App } from 'aws-cdk-lib';
import {VPCStack} from "./stacks/VPCStack";
import {UIDeploymentStack} from "./stacks/UIDeploymentStack";
import {PrometheusStack} from "./stacks/PrometheusStack";
/*
import {S3NotificationsStack} from "./stacks/S3NotificationsStack";
import {DynamoDBStreamLambdaStack} from "./stacks/DynamoDBStreamLambdaStack";
import {UIDeploymentStack} from "./stacks/UIDeploymentStack";
 */

const app = new App();

/*
new UIDeploymentStack(app, 'UIDeploymentStack');
new S3NotificationsStack(app, 'S3Stack');
new DynamoDBStreamLambdaStack(app, 'DynamoDBStreamLambdaStack');
new UIDeploymentStack(app, 'UIDeploymentStack');
*/

const vpcStack = new VPCStack(app, 'VPCStack');
new PrometheusStack(app, 'PrometheusStack', {
    vpc: vpcStack.vpc,
})