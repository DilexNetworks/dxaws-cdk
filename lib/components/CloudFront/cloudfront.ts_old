import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface CloudFrontStackProps extends cdk.StackProps {
    bucket: s3.IBucket;
    certificate: acm.Certificate; // Certificate ARN from the UsEast1Cert
    domainName: string; // The custom domain for the distribution
}

export class CloudFrontStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
        super(scope, id, props);

        const { bucket, certificate, domainName } = props;

        // Create an S3 bucket object for the given bucketname
        //const bucket = s3.Bucket.fromBucketName(this, 'WebsiteBucket', bucketName);

        // FROM: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront_origins-readme.html#restricting-access-to-a-standard-s3-origin                                                          // Create an Origin Access Control (OAC)
        const oac = new cloudfront.S3OriginAccessControl(this, 'MyOAC', {
            signing: cloudfront.Signing.SIGV4_NO_OVERRIDE
        });

        const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(bucket, {
                originAccessControl: oac,
                originAccessLevels: [cloudfront.AccessLevel.READ]
            }
        )

        // Define the Lambda@Edge function to add trailing slashes
        const edgeLambda = new lambda.Function(this, 'EdgeLambda', {
            code: lambda.Code.fromInline(`                                                
    'use strict';                                                                   
    exports.handler = async (event) => {                                            
      const request = event.Records[0].cf.request;                                  
      const uri = request.uri;                                                      
                                                                                    
      // If uri has no trailing slash or extension                                  
      if (!uri.includes('.') && !uri.endsWith('/')) {                           
        request.uri = uri + '/';                                                
      }                                                                         
                                                                                
      // If the URI ends with a slash                                           
      if (uri.endsWith('/') && !uri.endsWith('/index.html')) {                  
        request.uri = uri + 'index.html';                                       
      }                                                                         
                                                                                
      return request;                                                           
    };                                                                          
  `),
            handler: 'index.handler',
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
        });
        // Apply DeletionPolicy: Destroy
        edgeLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

        /**
            Because we are hosting a static website on S3, we do not need to pass cookies or query strings
            to the bucket.  This reduces the number of cached pages in CloudFront
            CachePolicy: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.CachePolicy.html
        */

        // Create our cache policy
        const cachePolicy = new cloudfront.CachePolicy(this, 'MyCachePolicy', {
            cachePolicyName: 'MyCachePolicy',
            queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),  // Do not cache query strings
            cookieBehavior: cloudfront.CacheCookieBehavior.none(),  // Do not cache cookies
        });

        // Create our OriginRequest Policy
        const originRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'MyOriginRequestPolicy', {
            originRequestPolicyName: 'MyOriginRequestPolicy',
            queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.none(),  // Do not forward query strings
            cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),  // Do not forward cookies
        });

        // Create the CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'myDist', {
            enabled: true,
            defaultRootObject: 'index.html',
            defaultBehavior: {
                origin: s3Origin,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cachePolicy: cachePolicy,  // Attach CachePolicy for caching behavior
                originRequestPolicy: originRequestPolicy,  // Attach OriginRequestPolicy for forwarding behavior
                edgeLambdas: [{
                    functionVersion: edgeLambda.currentVersion,
                    eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,  // Trigger on Viewer Request
                }],
            },
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
            ],
            domainNames: [domainName, `*.${domainName}`],
            certificate: certificate,
        });
        distribution.node.addDependency(certificate.certificateArn);


        /*
        // Create the CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'WebsiteDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(bucket), // Use the S3 bucket as the origin
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // Force HTTPS
            },
            domainNames: [props.domainName], // Custom domain
            certificate: cloudfront.ViewerCertificate.fromAcmCertificateArn(props.certificateArn), // SSL certificate
            defaultRootObject: 'index.html', // Serve index.html for root requests
        });
         */

        // Output the CloudFront distribution domain
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
            description: 'CloudFront distribution domain name',
        });

        // Output the bucket name for debugging or deployment
        new cdk.CfnOutput(this, 'BucketName', {
            value: bucket.bucketName,
            description: 'S3 bucket name for the website content',
        });
    }
}