import {Stack, StackProps} from 'aws-cdk-lib';
import {AttributeType, BillingMode, StreamViewType, Table as DynamoDBTable} from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from "constructs";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {Runtime, StartingPosition} from "aws-cdk-lib/aws-lambda";
import {join} from "path";
import {DynamoEventSource} from "aws-cdk-lib/aws-lambda-event-sources";
import {generateID} from "../../utils/IDGenerator";

/*
    * This stack creates a DynamoDB table with a stream and a Lambda function
    * that is triggered by the stream.
 */
export class DynamoDBStreamLambdaStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const table = new DynamoDBTable(this, generateID('dynamoDBStream'), {
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: { name: 'id', type: AttributeType.STRING },
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            tableName: 'Table',
        });

        const lambdaFunction = new NodejsFunction(this, generateID('dynamoDbLambdaStreamFunction'), {
            runtime: Runtime.NODEJS_18_X,
            handler: 'handler',
            entry: (join(__dirname, '..','..', 'lambda', 'dynamoStream', 'handler.ts')),
        });

        lambdaFunction.addEventSource(new DynamoEventSource(table, {
            startingPosition: StartingPosition.LATEST,
        }));
    }
}