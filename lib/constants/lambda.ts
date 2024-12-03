import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda';

// Common Lambda constants
export const LAMBDA = {
    RUNTIME: {
        NODEJS: lambda.Runtime.NODEJS_22_X
    },
    MEMORY: {
        SMALL: 128,
        MEDIUM: 256,
        LARGE: 512
    },
    TIMEOUT: {
        SHORT: cdk.Duration.seconds(30),
        MEDIUM: cdk.Duration.minutes(5)
    }
} as const;

// Some common lambda profiles
export const LAMBDA_PROFILE = {
    TINY: {
        runtime: LAMBDA.RUNTIME.NODEJS,
        memorySize: 128,
        timeout: cdk.Duration.seconds(3)
    },
    SMALL: {
        runtime: LAMBDA.RUNTIME.NODEJS,
        memorySize: 256,
        timeout: cdk.Duration.seconds(10)
    },
    MEDIUM: {
        runtime: LAMBDA.RUNTIME.NODEJS,
        memorySize: 512,
        timeout: cdk.Duration.minutes(1)
    },
    EDGE: {  // Specific for Lambda@Edge
        runtime: LAMBDA.RUNTIME.NODEJS,
        memorySize: 128,
        timeout: cdk.Duration.seconds(5)
    }
} as const;

