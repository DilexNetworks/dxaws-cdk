import { Construct } from 'constructs';

// Export constructs and props for the DxDns module
export { CloudFrontStack } from './CloudFront/cloudfront';
export interface CloudFrontStackProps {}

// Export constructs and props for the DxDns module
export { DxDnsStack } from './Route53/dx-dns';
export interface DxawsCdkProps {}

// Export constructs and props for the DxBucket module
export { DxBucket } from './S3/dx-bucket';
export interface DxBucketProps {}

// Export constructs and props for the SslCert module
export { SslCertStack } from './ACM/ssl_cert'
export interface SslCertStackProps {}

// Export constructs and props for the RootDelegationRole module
export { RootDelegationRoleStack } from './Route53/dns-root-account';
export interface RootDelegationRoleStackPropsRole {}


/*
export class DxawsCdk extends Construct {

  constructor(scope: Construct, id: string, props: DxawsCdkProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'DxawsCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
*/

