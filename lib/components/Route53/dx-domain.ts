import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from "constructs";
import { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';

interface DxDomainProps extends cdk.StackProps {
    domainName: string; // e.g., "dev.example.com"
}

export class DxDomain extends Construct {
    public readonly domainName: string;
    public readonly hostedZone: IHostedZone;

    constructor(scope: Construct, id: string, props: DxDomainProps) {
        super(scope, id);

        // Initialize properties
        this.domainName = props.domainName;
        this.hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
            domainName: this.domainName
        });
    }

    // this should go somewhere else
    public addCloudFrontRecord(distribution: IDistribution, hostNames: string[], cfDomainName: string): void {

        // add the ARecord Alias
        new route53.ARecord(this, 'CloudFrontAlias' + this.domainName, {
            zone: this.hostedZone,
            target: route53.RecordTarget.fromAlias(
                new targets.CloudFrontTarget(distribution)
            ),
            recordName: this.domainName,
            ttl: cdk.Duration.minutes(5)
        });

        const hNames: string[] = hostNames.filter(h => h !== "")
        for (const hostName of hNames) {
            // add a CNAME
            new route53.CnameRecord(this, 'CNAMERecord' + this.domainName + hostName, {
                zone: this.hostedZone,
                recordName: hostName,
                domainName: cfDomainName,
            });
        }
    }

    public outputNameServers(): void {
        new cdk.CfnOutput(this, 'SubDomainNameServers', {
            value: cdk.Fn.join(', ', this.hostedZone.hostedZoneNameServers || []),
        });
    }

    public get zoneId(): string {
        return this.hostedZone.hostedZoneId;
    }
}

