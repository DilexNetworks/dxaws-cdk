import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from 'aws-cdk-lib/aws-iam';
import {Construct} from "constructs";

interface DxDnsProps extends cdk.StackProps {
    subDomainName: string; // e.g., "dev.example.com"
    rootAccountId: string; // AWS Account ID of the parent account (where the root domain is provisioned)
    hostedZoneId: string; // This is the hosted zone id from Route53
}

export class DxDns extends Construct {
    private readonly subDomainName: string;
    private readonly rootAccountId: string;
    private readonly hostedZoneId: string;
    private subDomainHostedZone?: route53.PublicHostedZone;

    constructor(scope: Construct, id: string, props: DxDnsProps) {
        super(scope, id);

        // Initialize properties
        this.subDomainName = props.subDomainName;
        this.rootAccountId = props.rootAccountId;
        this.hostedZoneId = props.hostedZoneId;
    }

    public createSubdomainHostedZone(): void {
        this.subDomainHostedZone = new route53.PublicHostedZone(this, 'SubDomainHostedZone', {
            zoneName: this.subDomainName,
        });
    }

    public createDelegationRecord(): void {
        if (!this.subDomainHostedZone) {
            throw new Error('Subdomain hosted zone must be created before delegation records.');
        }

        const rootDomainName = this.extractRootDomain(this.subDomainName);
        const delegationRoleArn = `arn:aws:iam::${this.rootAccountId}:role/DxAwsRoute53DelegationRole-${rootDomainName.replace(
            /\./g,
            '-'
        )}`;

        const delegationRole = iam.Role.fromRoleArn(this, 'DelegationRole', delegationRoleArn);

        new route53.CrossAccountZoneDelegationRecord(this, 'DelegationRecord', {
            delegatedZone: this.subDomainHostedZone,
            parentHostedZoneId: this.hostedZoneId,
            delegationRole: delegationRole,
        });
    }

    private extractRootDomain(subDomainName: string): string {
        const domainParts = subDomainName.split('.');
        if (domainParts.length < 2) {
            throw new Error('Invalid subDomainName. It must be a valid subdomain like "dev.example.com".');
        }
        return `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
    }

    public outputNameServers(): void {
        if (!this.subDomainHostedZone) {
            throw new Error('Subdomain hosted zone must be created before outputting nameservers.');
        }

        new cdk.CfnOutput(this, 'SubDomainNameServers', {
            value: cdk.Fn.join(', ', this.subDomainHostedZone.hostedZoneNameServers || []),
        });
    }

}