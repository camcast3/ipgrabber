const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING)

module.exports = async function (context, req) {
    try {
        const database = await mongoClient.db(process.env.MONGODB_DATABSE);
        const collection = database.collection(process.env.MONGODB_COLLECTION);
        
        const { MongClient } = require("mongodb");

        let callerip = req.get('X-Forwarded-For');
        
        if (!callerip) {
            context.res = {
                "headers": {
                    "content-type": "application/json"
                },
                "body": {
                    "message": "This HTTP triggered function executed successfully. Unable to detect your IP address. Please contact CAMM."
                }
            };
            return
        } 
        
        let ipv4 = callerip.split(":");
        const iprange = ipv4[0] + '/32';
        const name = (req.query.name || (req.body && req.body.name));

        if (!name){
            context.res = {
                "headers": {
                    "content-type": "application/json"
                },
                "body": {
                    "message": "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for your IP to be saved."
                }
            };
            return
        } 

        await collection.updateOne(
            {
                "iprange": iprange,
            },
            {
                $setOnInsert: 
                {
                    "name": name, 
                    "iprange": iprange
                }
            },
            {upsert: true}
        );

        context.res = {
            "headers": {
                "content-type": "application/json"
            },
            "body": {
                "message": "Successfully added entry: name = " + name + ", ipranges = " + iprange 
            }
        };
    
    } catch (error) {
        context.res = {
            "status": 500,
            "headers": {
                "content-type": "application/json"
            },
            "body": {
                "message": error.toString()
            }
        };
    }
}