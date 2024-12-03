import * as cdk from 'aws-cdk-lib';

// Common AWS Global Policies
export const AWS = {
    REGIONS: {
        US_EAST_1: 'us-east-1',  // N. Virginia
        US_EAST_2: 'us-east-2',  // Ohio
        US_WEST_1: 'us-west-1',  // N. California
        US_WEST_2: 'us-west-2'   // Oregon
    },

    REMOVAL_POLICY: {
        RETAIN: cdk.RemovalPolicy.RETAIN,
        DESTROY: cdk.RemovalPolicy.DESTROY,
        SNAPSHOT: cdk.RemovalPolicy.SNAPSHOT
    },

    DURATION: {
        SHORT: cdk.Duration.minutes(5),
        MEDIUM: cdk.Duration.hours(1),
        LONG: cdk.Duration.days(1)
    },

    ENVIRONMENT: {
        DEV: 'development',
        STAGE: 'staging',
        PROD: 'production'
    },

    TAGS: {
        ENVIRONMENT: 'Environment',
        PROJECT: 'Project',
        COST_CENTER: 'CostCenter',
        OWNER: 'Owner'
    }
} as const;

// ... other exports
export * from './lambda';
export * from './cloudfront';
export * from './s3';
// export * from './route53';