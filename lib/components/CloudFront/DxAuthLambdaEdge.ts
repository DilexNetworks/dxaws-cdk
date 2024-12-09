import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { LAMBDA_PROFILE } from "@constants/lambda";


export class DxAuthLambdaEdge extends Construct {
    public readonly function: lambda.Function;

    constructor(scope: Construct, id: string, props: { username: string; password: string }) {
        super(scope, id);

        this.function = new lambda.Function(this, 'AuthFunction', {
            ...LAMBDA_PROFILE.EDGE,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
                exports.handler = async (event) => {
                    const request = event.Records[0].cf.request;
                    const authString = "Basic " + Buffer.from("${props.username}:${props.password}").toString('base64');
                    
                    const headers = request.headers;
                    if (!headers.authorization || headers.authorization[0].value !== authString) {
                        return {
                            status: '401',
                            statusDescription: 'Unauthorized',
                            headers: {
                                'www-authenticate': [{
                                    key: 'WWW-Authenticate',
                                    value: 'Basic'
                                }]
                            }
                        };
                    }
                    
                    return request;
                }
            `),
        });

        this.function.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
        // also clean up versions
        const version = this.function.currentVersion;
        version.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    }
}