import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface DxBucketProps {
    /**
     * The profile determines the configuration of the bucket
     * Predefined profiles:
     * - `DEV`: Development environment (versioned, auto-deleted, removal policy = DESTROY).
     * - `PROD`: Production environment (versioned, encrypted, removal policy = RETAIN).
     * - `ARCHIVE`: Archival bucket (no versioning, lifecycle rules for expiration, removal policy = RETAIN).
     */
    profile: BucketProfile;

    /**
     * additional S3 bucket properties to override or extend the profile settings
     * For example:
     *  ```
     *  overrides: {
     *      bucketName: 'custom-name',
     *      lifecycleRules: [{ expiration: cdk.Duration.days(90) }],
     *  }
     *  ```
     */
    overrides?: s3.BucketProps;
}

export enum BucketProfile {
    DEV = 'dev',
    PROD = 'prod',
    ARCHIVE = 'archive',
}

/**
 * A construct that creates an S3 bucket based on the specified profile and allows customization through overrides.
 *
 * @example
 * Basic usage with a predefined profile:
 * ```
 * const bucket = new DxBucket(this, 'DevBucket', {
 *     profile: BucketProfile.DEV,
 * });
 * ```
 *
 * Using overrides to customize the bucket:
 * ```
 * const bucket = new DxBucket(this, 'CustomBucket', {
 *     profile: BucketProfile.PROD,
 *     overrides: {
 *         bucketName: 'my-custom-prod-bucket',
 *         lifecycleRules: [{ expiration: cdk.Duration.days(90) }],
 *     },
 * });
 * ```
 */

// define a few bucket profiles
const PROFILE_SETTINGS: Record<BucketProfile, Partial<s3.BucketProps>> = {
    [BucketProfile.DEV]: {
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
    },
    [BucketProfile.PROD]: {
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        autoDeleteObjects: false, // Retain objects in production
        encryption: s3.BucketEncryption.S3_MANAGED,
    },
    [BucketProfile.ARCHIVE]: {
        versioned: false,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        autoDeleteObjects: false,
        lifecycleRules: [ { expiration: cdk.Duration.days(365) }],
    },
}

export class DxBucket extends Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: DxBucketProps) {
        super(scope, id);

        // Get the bucket profile
        const profileSettings = PROFILE_SETTINGS[props.profile];
        if (!profileSettings) {
            throw new Error(`Invalid bucket profile: ${props.profile}`)
        }

        // Get the base profile settings
        const baseSettings = PROFILE_SETTINGS[props.profile];
        if (!baseSettings) {
            throw new Error(`Invalid bucket profile: ${props.profile}`);
        }

        // Merge the base settings with user-provided overrides
        const bucketProps = {
            ...baseSettings,
            ...props.overrides, // User-specified properties take precedence
        };

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
}