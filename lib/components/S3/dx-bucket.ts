import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { S3_PROFILES, S3_BUCKET_PROFILES } from "@constants/s3";

export interface DxBucketProps extends cdk.StackProps {
    profile: S3_BUCKET_PROFILES;
    overrides?: s3.BucketProps;
}

export class DxBucket extends Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: DxBucketProps) {
        super(scope, id);

        const profile = props.profile || S3_BUCKET_PROFILES.DEV;
        const profileSettings = S3_PROFILES[profile];
        if (!profileSettings) {
            throw new Error(`Invalid bucket profile: ${profile}`);
        }

        // Merge the base settings with user-provided overrides
        const bucketProps = {
            ...profileSettings,
            ...props.overrides || {}, // User-specified properties take precedence
        };

        // Create the bucket
        this.bucket = new s3.Bucket(this, 'DxBucket', bucketProps);

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

/*
const stackName = Stack.of(this).stackName;
new cdk.CfnOutput(this, 'BucketNameOutput', {
    value: this.bucket.bucketName,
    description: 'The name of the S3 bucket',
    exportName: `${stackName}-${id}-BucketName`, // Optional: Makes the output globally exportable
});

// Optionally, output the bucket ARN as well
new cdk.CfnOutput(this, 'BucketArnOutput', {
    value: this.bucket.bucketArn,
    description: 'The ARN of the S3 bucket',
    exportName: `${stackName}-${id}-BucketArn`, // Optional
});
*/