import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { S3_PROFILES, S3_BUCKET_PROFILES } from "@constants/s3";

// Define the properties for DxBucket
export interface DxBucketProps extends cdk.StackProps {
    /**
     * The profile determines the configuration of the bucket
     * Predefined profiles:
     * - `DEV`: Development environment (versioned, auto-deleted, removal policy = DESTROY).
     * - `PROD`: Production environment (versioned, encrypted, removal policy = RETAIN).
     * - `ARCHIVE`: Archival bucket (no versioning, lifecycle rules for expiration, removal policy = RETAIN).
     */
    profile: S3_BUCKET_PROFILES;

    /**
     * Additional S3 bucket properties to override or extend the profile settings
     * For example:
     * ```
     * overrides: {
     *     bucketName: 'custom-name',
     *     lifecycleRules: [{ expiration: cdk.Duration.days(90) }],
     * }
     * ```
     */
    overrides?: s3.BucketProps;
}

export class DxBucket extends Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: DxBucketProps) {
        super(scope, id);

        const profileSettings = S3_PROFILES[props.profile];
        if (!profileSettings) {
            throw new Error(`Invalid bucket profile: ${props.profile}`);
        }

        // Merge the base settings with user-provided overrides
        const bucketProps = {
            ...profileSettings,
            ...props.overrides || {}, // User-specified properties take precedence
        };

        // these are the properties we have for this bucket
        console.log('Resolved bucket properties:', bucketProps);

        // Create the bucket
        this.bucket = new s3.Bucket(this, 'DxBucket', bucketProps);


        // Create an output for the bucket name
        new cdk.CfnOutput(this, 'BucketNameOutput', {
            value: this.bucket.bucketName,
            description: 'The name of the S3 bucket',
            exportName: `${id}-BucketName`, // Optional: Makes the output globally exportable
        });

        // Optionally, output the bucket ARN as well
        new cdk.CfnOutput(this, 'BucketArnOutput', {
            value: this.bucket.bucketArn,
            description: 'The ARN of the S3 bucket',
            exportName: `${id}-BucketArn`, // Optional
        });
    }

    public get bucketName(): string {
        return this.bucket.bucketName;
    }

    public get bucketArn(): string {
        return this.bucket.bucketArn;
    }

    public getBucket(): s3.IBucket {
        return this.bucket as s3.IBucket;
    }
}