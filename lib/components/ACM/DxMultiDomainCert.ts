import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { Construct } from 'constructs';
import { DxDomain } from '@components/Route53'

export interface DxMultiDomainCertProps {
    priDomain: DxDomain;
    altDomains: DxDomain[];
    hostNames: string[];
}

export class DxMultiDomainCert extends Construct {
    public readonly certificate: Certificate;
    readonly priDomain: DxDomain;
    readonly altDomains: DxDomain[];
    readonly hostNames: string[];

    constructor(scope: Construct, id: string, props: DxMultiDomainCertProps) {
        super(scope, id);
        this.priDomain = props.priDomain
        this.altDomains = props.altDomains
        this.hostNames = props.hostNames

        // build the domain to hosted zone map
        const domainMap: Record<string, IHostedZone> = {
            [this.priDomain.domainName]: this.priDomain.hostedZone,
            ...Object.fromEntries(
                this.altDomains.map(d => [d.domainName, d.hostedZone])
            )
        };

        // build the host.domain to hostedZone map
        const allHosts: Record<string, IHostedZone> = {};
        for (const [domain, hostedZone] of Object.entries(domainMap)) {
            for (const host of this.hostNames) {
                const fqdn = host ? `${host}.${domain}` : domain;
                allHosts[fqdn] = hostedZone;
            }
        }
        const allFqdns = Object.keys(allHosts);

        // pick the first domain to be the primary
        const [primaryDomain, ...sanDomains] = allFqdns;

        this.certificate = new Certificate(this, 'MultiDomainCertificate', {
            domainName: primaryDomain,
            subjectAlternativeNames: sanDomains,
            validation: CertificateValidation.fromDnsMultiZone(allHosts),
        })
    }
}