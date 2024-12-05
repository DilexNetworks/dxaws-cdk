import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { DxBucket } from '@components/S3';
import { S3_BUCKET_PROFILES } from "@constants/s3";

describe('DxBucket', () => {
    test('DEV profile creates a versioned bucket with auto-delete enabled', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        // Instantiate the DxBucket construct with the DEV profile
        new DxBucket(stack, 'DevBucket', {
            profile: S3_BUCKET_PROFILES.DEV,
        });

        // Get the synthesized CloudFormation template
        const template = Template.fromStack(stack);

        // Assert that the bucket exists and has the correct properties
        template.hasResourceProperties('AWS::S3::Bucket', {
            VersioningConfiguration: { Status: 'Enabled' },
        });

        // Assert that the bucket is set to be destroyed on stack deletion
        template.hasResource('AWS::S3::Bucket', {
            DeletionPolicy: 'Delete',
        });
    });

    test('PROD profile creates a bucket with encryption and retains resources', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        // Instantiate the DxBucket construct with the PROD profile
        new DxBucket(stack, 'ProdBucket', {
            profile: S3_BUCKET_PROFILES.PROD,
        });

        // Get the synthesized CloudFormation template
        const template = Template.fromStack(stack);

        // Assert that the bucket is encrypted with S3 managed keys
        template.hasResourceProperties('AWS::S3::Bucket', {
            BucketEncryption: Match.objectLike({
                ServerSideEncryptionConfiguration: [
                    { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } },
                ],
            }),
        });

        // Assert that the bucket is retained on stack deletion
        template.hasResource('AWS::S3::Bucket', {
            DeletionPolicy: 'Retain',
        });
    });

    test('Overrides are applied correctly', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        // Instantiate the DxBucket construct with overrides
        new DxBucket(stack, 'CustomBucket', {
            profile: S3_BUCKET_PROFILES.PROD,
            overrides: {
                bucketName: 'custom-bucket-name',
            },
        });

        // Get the synthesized CloudFormation template
        const template = Template.fromStack(stack);

        // Assert that the bucket name matches the override
        template.hasResourceProperties('AWS::S3::Bucket', {
            BucketName: 'custom-bucket-name',
        });
    });
});
