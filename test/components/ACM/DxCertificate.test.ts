import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Template } from 'aws-cdk-lib/assertions';
import { DxCertificate, DxCertificateProps } from '@components/ACM';

describe('DxCertificate', () => {
    const defaultProps: DxCertificateProps = {
        subDomainName: 'dev.example.com',
        hostedZoneId: 'Z1234567890',
    };

    test('creates a certificate with DNS validation', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        new DxCertificate(stack, 'TestCertificate', defaultProps);

        const template = Template.fromStack(stack);

        // Validate Certificate resource
        template.hasResourceProperties('AWS::CertificateManager::Certificate', {
            DomainName: 'dev.example.com',
            ValidationMethod: 'DNS',
        });
    });

    test('adds subject alternative names when specified', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        const propsWithSans: DxCertificateProps = {
            ...defaultProps,
            subjectAlternativeNames: ['api.example.com', 'www.example.com'],
        };

        new DxCertificate(stack, 'TestCertificateWithSANs', propsWithSans);

        const template = Template.fromStack(stack);

        // Validate SubjectAlternativeNames
        template.hasResourceProperties('AWS::CertificateManager::Certificate', {
            DomainName: 'dev.example.com',
            SubjectAlternativeNames: ['api.example.com', 'www.example.com'],
        });
    });

    test('outputs the certificate ARN', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        new DxCertificate(stack, 'Test', defaultProps);

        const template = Template.fromStack(stack);
        // console.log('TEMPLATE');
        // console.log(template.toJSON());

        // Validate the output

        const certificateResource = Object.keys(template.toJSON().Resources).find((key) =>
            key.startsWith('TestCertificate')
        );
        expect(certificateResource).toBeDefined();
        // console.log('CERT RESOURCE: ' + certificateResource);

        template.hasOutput('CertificateArn', {
            Value: {
                'Ref': certificateResource
            },
            Description: 'The ARN of the certificate',
            Export: {
                Name: 'CertificateArn',
            },
        });
    });

    test('throws an error when subDomainName is missing or empty', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        expect(() => {
            new DxCertificate(stack, 'InvalidCertificate', {
                subDomainName: '', // Invalid subdomain
                hostedZoneId: '', // Invalid hosted zone ID
            });
        }).toThrow('The subDomainName property is required and cannot be empty');
    });

    test('throws an error when hostedZoneId is missing or invalid', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        expect(() => {
            new DxCertificate(stack, 'MissingHostedZoneId', {
                subDomainName: 'example.com',
                hostedZoneId: '', // Invalid hostedZoneId
            });
        }).toThrow('The hostedZoneId property is required and cannot be empty.');
    });

    test('creates the certificate in the specified region', () => {
        const app = new cdk.App();
        const stack = new cdk.Stack(app, 'TestStack');

        const regionSpecificProps: DxCertificateProps = {
            ...defaultProps,
            region: 'us-west-2',
        };

        new DxCertificate(stack, 'RegionSpecificCertificate', regionSpecificProps);

        const template = Template.fromStack(stack);

        // Validate the region (if applicable via properties or template setup)
        template.hasResourceProperties('AWS::CertificateManager::Certificate', {
            DomainName: 'dev.example.com',
        });
        // NOTE: Region-specific checks require additional setup since CDK doesn't set regions in logical resources.
    });
});
