// constants/cloudfront.ts
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cdk from 'aws-cdk-lib';

export const CLOUDFRONT = {
    PRICE_CLASS: {
        NORTH_AMERICA_EUROPE: cloudfront.PriceClass.PRICE_CLASS_100,
        PLUS_ASIA_AFRICA: cloudfront.PriceClass.PRICE_CLASS_200,
        ALL_REGIONS: cloudfront.PriceClass.PRICE_CLASS_ALL
    },

    SSL_METHOD: {
        SNI: cloudfront.SSLMethod.SNI,
        VIP: cloudfront.SSLMethod.VIP  // Legacy, costs extra
    },

    SECURITY_POLICY: {
        TLS_V1_2: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        TLS_V1_1: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        TLS_V1: cloudfront.SecurityPolicyProtocol.TLS_V1
    },

    VIEWER_PROTOCOL: {
        HTTPS_ONLY: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        REDIRECT_TO_HTTPS: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        ALLOW_ALL: cloudfront.ViewerProtocolPolicy.ALLOW_ALL
    },

    CACHE_POLICY: {
        DURATION: {
            SHORT: cdk.Duration.minutes(5),
            MEDIUM: cdk.Duration.hours(1),
            LONG: cdk.Duration.days(1)
        }
    },

    ERROR_RESPONSE: {
        TTL: {
            SHORT: cdk.Duration.seconds(10),
            MEDIUM: cdk.Duration.minutes(5),
            LONG: cdk.Duration.hours(1)
        }
    },

    METHODS: {
        BASIC: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        EXTENDED: cloudfront.AllowedMethods.ALLOW_ALL
    },

    CACHE_METHODS: {
        BASIC: cloudfront.CachedMethods.CACHE_GET_HEAD,
        WITH_OPTIONS: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS
    },

} as const;