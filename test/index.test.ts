import * as index from '../lib/index';

describe('Module Exports', () => {
    // Test for DxCloudFront export
    it('should export DxCloudFront from @components/CloudFront', () => {
        const { DxCloudFront } = require('@components/CloudFront');
        expect(index.DxCloudFront).toBe(DxCloudFront);
    });

    // Test for DxDns export
    it('should export DxDns from @components/Route53', () => {
        const { DxDns } = require('@components/Route53');
        expect(index.DxDns).toBe(DxDns);
    });

    // Test for DxBucket export
    it('should export DxBucket from @components/S3', () => {
        const { DxBucket } = require('@components/S3');
        expect(index.DxBucket).toBe(DxBucket);
    });

    // Test for S3_PROFILES and S3_BUCKET_PROFILES export
    it('should export S3_PROFILES and S3_BUCKET_PROFILES from @constants/s3', () => {
        const { S3_PROFILES, S3_BUCKET_PROFILES } = require('@constants/s3');
        expect(index.S3_PROFILES).toBe(S3_PROFILES);
        expect(index.S3_BUCKET_PROFILES).toBe(S3_BUCKET_PROFILES);
    });

    // Test for DxCertificate export
    it('should export DxCertificate from @components/ACM', () => {
        const { DxCertificate } = require('@components/ACM');
        expect(index.DxCertificate).toBe(DxCertificate);
    });

    // Test for RootDelegationRoleStack export
    it('should export RootDelegationRoleStack from @components/Route53', () => {
        const { RootDelegationRoleStack } = require('@components/Route53');
        expect(index.RootDelegationRoleStack).toBe(RootDelegationRoleStack);
    });
});