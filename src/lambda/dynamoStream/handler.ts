async function handler(event: any, context: any) {
    event.Records.forEach((record) => {
        console.log('Event Id: %s', record.eventID);
        console.log('Event Id: %s', record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);
    });
}

export {handler};