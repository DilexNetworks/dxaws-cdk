import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface SslCertProps extends cdk.StackProps {
    subDomainName: string; // e.g., "dev.example.com"
}

export class SslCertStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: SslCertProps) {
        super(scope, id, props);

        const { subDomainName } = props;

        // Import an existing hosted zone
        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: subDomainName,
        });

        // Always provision this certificate in us-east-1
        const certStack = new cdk.Stack(this, 'CertStack', {
            env: {
                region: 'us-east-1',
            },
        });

        // Request an SSL certificate with DNS validation
        const certificate = new acm.Certificate(this, 'SiteCertificate', {
            domainName: subDomainName,
            subjectAlternativeNames: [`*.${subDomainName}`], // Optional: Include a wildcard for subdomains
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        // Output the ARN of the certificate
        new cdk.CfnOutput(this, 'CertificateArn', {
            value: certificate.certificateArn,
            description: 'The ARN of the SSL certificate',
        });
    }
}