import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export interface DxCertificateProps {
    subDomainName: string;
    hostedZoneId: string
    region?: string;  // Optional: for cross-region certs
    subjectAlternativeNames?: string[];  // Optional: SANs
}

export class DxCertificate extends Construct {
    public readonly certificate: acm.Certificate;

    constructor(scope: Construct, id: string, props: DxCertificateProps) {
        super(scope, id);

        // Validate required properties
        if (!props.subDomainName || props.subDomainName.trim() === '') {
            throw new Error('The subDomainName property is required and cannot be empty.');
        }

        if (!props.hostedZoneId || props.hostedZoneId.trim() === '') {
            throw new Error('The hostedZoneId property is required and cannot be empty.');
        }

        // Import an existing hosted zone
        const subDomainHostedZone = route53.HostedZone.fromHostedZoneAttributes(
            this, 'SubDomainHostedZone', {
                zoneName: props.subDomainName,
                hostedZoneId: props.hostedZoneId
            }
        );

        this.certificate = new acm.Certificate(this, 'Certificate', {
            domainName: props.subDomainName,
            validation: acm.CertificateValidation.fromDns(subDomainHostedZone),
            subjectAlternativeNames: props.subjectAlternativeNames,
            ...(props.region && { region: props.region })
        });

        // Add outputs
        new cdk.CfnOutput(this, 'CertificateArn', {
            value: this.certificate.certificateArn,
            description: 'The ARN of the certificate',
            exportName: 'CertificateArn'
        }).overrideLogicalId('CertificateArn');
    }

    public get certificateArn(): string {
        return this.certificate.certificateArn;
    }
}

/*

interface DxSSLCertProps extends cdk.StackProps {
    subDomainName: string; // e.g., "dev.example.com"
}

export class DxSSLCert extends Construct {
    public readonly certificate: acm.Certificate;

    constructor(scope: Construct, id: string, props: DxSSLCertProps) {
        super(scope, id);

        const { subDomainName } = props;

        // Import an existing hosted zone
        const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
            domainName: subDomainName,
        });

        // Request an SSL certificate with DNS validation
        this.certificate = new acm.Certificate(this, 'SiteCertificate', {
            domainName: subDomainName,
            subjectAlternativeNames: [`*.${subDomainName}`], // Optional: Include a wildcard for subdomains
            validation: acm.CertificateValidation.fromDns(hostedZone),
        });

        // Output the ARN of the certificate
        new cdk.CfnOutput(this, 'CertificateArn', {
            value: this.certificate.certificateArn,
            description: 'The ARN of the SSL certificate',
        });
    }
}

/*
// Always provision this certificate in us-east-1
const certStack = new cdk.Stack(this, 'CertStack', {
    env: {
        region: 'us-east-1',
    },
});
 */
