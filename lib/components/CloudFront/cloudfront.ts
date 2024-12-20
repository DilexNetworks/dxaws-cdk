import * as cdk from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { S3_PROFILES, S3_BUCKET_PROFILES } from "@constants/s3";
import { Construct } from 'constructs'

export interface EdgeFunctionConfig {
    function: lambda.Function;
    eventType: cloudfront.LambdaEdgeEventType;
}

export interface DxCloudFrontProps {
    bucket: s3.IBucket;
    defaultRootObject?: string;
    priceClass?: cloudfront.PriceClass;
    edgeFunctions?: EdgeFunctionConfig[];
}

export class DxCloudFront extends Construct {
    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: DxCloudFrontProps) {
        super(scope, id);

        const oac = new cloudfront.S3OriginAccessControl(this, 'MyOAC', {
            signing: cloudfront.Signing.SIGV4_NO_OVERRIDE
        });

        const s3Origin = origins.S3BucketOrigin.withOriginAccessControl(props.bucket, {
                originAccessControl: oac,
                originAccessLevels: [cloudfront.AccessLevel.READ]
            }
        )

        // create a logging bucket for cloudfront
        const loggingBucket = new s3.Bucket(this, 'LoggingBucket', {
            ...S3_PROFILES[S3_BUCKET_PROFILES.LOGGING],
        });


        // Create the distribution
        this.distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: s3Origin,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                edgeLambdas: props.edgeFunctions?.map(ef => ({
                    functionVersion: ef.function.currentVersion,
                    eventType: ef.eventType,
                    includeBody: false
                })),
            },
            defaultRootObject: props.defaultRootObject || 'index.html',
            priceClass: props.priceClass || cloudfront.PriceClass.PRICE_CLASS_100,
            enableLogging: true,
            logBucket: loggingBucket,
            logFilePrefix: 'cloudfront-logs/'
        });

        // Update bucket policy
        const bucketPolicyStatement = new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            effect: iam.Effect.ALLOW,
            principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
            resources: [`${props.bucket.bucketArn}/*`],
            conditions: {
                StringEquals: {
                    'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Stack.of(this).account}:distribution/${this.distribution.distributionId}`
                }
            }
        });

        props.bucket.addToResourcePolicy(bucketPolicyStatement);
    }

    public get distributionId(): string {
        return this.distribution.distributionId;
    }

    public get distributionDomainName(): string {
        return this.distribution.distributionDomainName;
    }
}