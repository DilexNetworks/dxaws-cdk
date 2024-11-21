import * as route53 from 'aws-cdk-lib/aws-route53';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

interface DxDnsProps extends cdk.StackProps {
    subDomainName: string; // e.g., "dev.example.com"
    rootAccountId: string; // AWS Account ID of the parent account (where the root domain is provisioned)
    hostedZoneId: string; // This is the hosted zone id from Route53
}

export class DxDnsStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: DxDnsProps) {
        super(scope, id, props);

        const { subDomainName, rootAccountId, hostedZoneId } = props;

        // Derive the root domain name by extracting the last two parts of the subdomain
        const domainParts = subDomainName.split('.');
        if (domainParts.length < 2) {
            throw new Error('Invalid subDomainName. It must be a valid subdomain like "dev.example.com".');
        }
        const rootDomainName = `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;

        /*
        // Look up the root hosted zone dynamically
        console.log('DN:', rootDomainName);
        const rootHostedZone = route53.HostedZone.fromLookup(this, 'RootHostedZone', {
            domainName: rootDomainName,
        });
         */

        // Create a hosted zone for the subdomain in the local account
        const subDomainHostedZone = new route53.PublicHostedZone(this, 'SubDomainHostedZone', {
            zoneName: subDomainName,
        });

        // Define the delegation role ARN in the parent account
        const delegationRoleArn = `arn:aws:iam::${rootAccountId}:role/DxAwsRoute53DelegationRole-${rootDomainName.replace(/\./g, '-')}`;

        // Import the delegation role
        const delegationRole = iam.Role.fromRoleArn(this, 'DelegationRole', delegationRoleArn);

        // Create a delegation record in the root domain's hosted zone
        new route53.CrossAccountZoneDelegationRecord(this, 'DelegationRecord', {
            delegatedZone: subDomainHostedZone,
            parentHostedZoneId: hostedZoneId,
            delegationRole: delegationRole,
        });

        // Output the nameservers for the subdomain hosted zone
        new cdk.CfnOutput(this, 'SubDomainNameServers', {
            value: cdk.Fn.join(', ', subDomainHostedZone.hostedZoneNameServers || []),
        });
    }
}