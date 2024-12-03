import * as lambda from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { LAMBDA_PROFILE } from '@constants/lambda';

export class DxWebsiteLambdaEdge extends Construct {
    public readonly function: lambda.Function;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.function = new lambda.Function(this, 'UrlRewriteFunction', {
            ...LAMBDA_PROFILE.EDGE,
            handler: 'index.handler',
            code: lambda.Code.fromInline(`
                exports.handler = async (event) => {
                    const request = event.Records[0].cf.request;
                    const uri = request.uri;
                    
                    // Always add a trailing slash to directory-like requests
                    if (!uri.includes('.') && uri.slice(-1) !== '/') {
                        return {
                            status: '301',
                            statusDescription: 'Moved Permanently',
                            headers: {
                                'location': [{
                                    key: 'Location',
                                    value: uri + '/'
                                }],
                            }
                        };
                    }
                    
                    // Append index.html to directory requests
                    if (uri.slice(-1) === '/') {
                        request.uri += 'index.html';
                    }
                    
                    return request;
                }
            `),
        });
    }
}