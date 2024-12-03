import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';

// Define the bucket profiles
export enum S3_BUCKET_PROFILES {
    DEV = 'dev',
    PROD = 'prod',
    ARCHIVE = 'archive',
}

// Predefined profile settings for buckets
export const S3_PROFILES: Record<S3_BUCKET_PROFILES, Partial<s3.BucketProps>> = {
    [S3_BUCKET_PROFILES.DEV]: {
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
    },
    [S3_BUCKET_PROFILES.PROD]: {
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        autoDeleteObjects: false, // Retain objects in production
        encryption: s3.BucketEncryption.S3_MANAGED,
    },
    [S3_BUCKET_PROFILES.ARCHIVE]: {
        versioned: false,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        autoDeleteObjects: false,
        lifecycleRules: [{ expiration: cdk.Duration.days(365) }],
    },
};