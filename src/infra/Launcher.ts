import { App } from 'aws-cdk-lib';
import {S3NotificationsStack} from "./stacks/S3NotificationsStack";

const app = new App(); 

new S3NotificationsStack(app, 'S3Stack');