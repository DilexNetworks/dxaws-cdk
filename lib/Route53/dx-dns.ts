import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from "constructs";

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

    /*
    public createSubdomainHostedZone(): void {
        this.subDomainHostedZone = new route53.PublicHostedZone(this, 'SubDomainHostedZone', {
            zoneName: this.subDomainName,
        });
        this.subDomainHostedZone.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    }

     */
    public createSubdomainHostedZone(): void {
        this.subDomainHostedZone = new route53.PublicHostedZone(this, 'SubDomainHostedZone', {
            zoneName: this.subDomainName,
        });
        this.subDomainHostedZone.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

        // Create a custom resource to clean up records
        const cleanupProvider = new cr.Provider(this, 'CleanupProvider', {
            onEventHandler: new lambda.Function(this, 'CleanupFunction', {
                runtime: lambda.Runtime.NODEJS_18_X,
                handler: 'index.handler',
                code: lambda.Code.fromInline(`
                const { Route53Client, ListResourceRecordSetsCommand, ChangeResourceRecordSetsCommand } = require('@aws-sdk/client-route-53');
                const client = new Route53Client();
                
                exports.handler = async (event) => {
                    console.log('Event:', JSON.stringify(event, null, 2));
                    
                    if (event.RequestType === 'Delete') {
                        const zoneId = event.ResourceProperties.hostedZoneId;
                        console.log('Cleaning up hosted zone:', zoneId);
                        
                        try {
                            // Get all records
                            const listCommand = new ListResourceRecordSetsCommand({
                                HostedZoneId: zoneId
                            });
                            const records = await client.send(listCommand);
                            
                            console.log('Found records:', JSON.stringify(records, null, 2));
                            
                            // Delete all non-NS and non-SOA records
                            for (const record of records.ResourceRecordSets) {
                                if (record.Type !== 'NS' && record.Type !== 'SOA') {
                                    console.log('Deleting record:', JSON.stringify(record, null, 2));
                                    const changeCommand = new ChangeResourceRecordSetsCommand({
                                        HostedZoneId: zoneId,
                                        ChangeBatch: {
                                            Changes: [{
                                                Action: 'DELETE',
                                                ResourceRecordSet: record
                                            }]
                                        }
                                    });
                                    await client.send(changeCommand);
                                    console.log('Successfully deleted record');
                                }
                            }
                            console.log('Cleanup completed successfully');
                        } catch (error) {
                            console.error('Error during cleanup:', error);
                            throw error;
                        }
                    }
                    return;
                }
            `)
            })
        });

        // Give the cleanup function necessary permissions
        cleanupProvider.onEventHandler.addToRolePolicy(new iam.PolicyStatement({
            actions: ['route53:ListResourceRecordSets', 'route53:ChangeResourceRecordSets'],
            resources: [`arn:aws:route53:::hostedzone/${this.subDomainHostedZone.hostedZoneId}`]
        }));

        new cdk.CustomResource(this, 'ZoneCleanup', {
            serviceToken: cleanupProvider.serviceToken,
            properties: {
                hostedZoneId: this.subDomainHostedZone.hostedZoneId
            }
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

    public get hostedZone(): route53.IHostedZone {
        if (!this.subDomainHostedZone) {
            throw new Error('Subdomain hosted zone has not been created yet.');
        }
        return this.subDomainHostedZone;
    }

    // Add getter for the hosted zone ID
    public get zoneId(): string {
        if (!this.subDomainHostedZone) {
            throw new Error('Subdomain hosted zone has not been created yet.');
        }
        return this.subDomainHostedZone.hostedZoneId;
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