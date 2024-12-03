import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

interface RootDelegationRoleStackProps extends cdk.StackProps {
    organizationId: string; // AWS OrgID
    rootDomainName: string; // The domain this role will allow access to
    hostedZoneId: string;  // The hosted zone id for the root domain
}

export class RootDelegationRoleStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props: RootDelegationRoleStackProps) {
        super(scope, id, props);

        const organizationId = props.organizationId
        const rootDomainName = props.rootDomainName
        const hostedZoneId = props.hostedZoneId

        // Create an IAM role in the root account
        const delegationRole = new iam.Role(this, 'Route53DelegationRole', {
            roleName: `DxAwsRoute53DelegationRole-${rootDomainName.replace(/\./g, '-')}`,
            description: `Allows accounts in org to modify Route 53 records for ${rootDomainName}`,
            assumedBy: new iam.ServicePrincipal('sts.amazonaws.com'),
        });

        delegationRole.assumeRolePolicy?.addStatements(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['sts:AssumeRole'],
                principals: [new iam.AnyPrincipal()],
                conditions: {
                    StringEquals: {
                        'aws:PrincipalOrgId': organizationId, // Restrict to organization accounts
                    },
                },
            })
        );

        /*
        // This denies access unless the principal is a member of the organization
        delegationRole.assumeRolePolicy?.addStatements(
            new iam.PolicyStatement({
                effect: iam.Effect.DENY,
                actions: ['sts:AssumeRole'],
                principals: [new iam.AnyPrincipal()],
                conditions: {
                    StringNotEquals: {
                        'aws:PrincipalOrgId': organizationId, // Restrict to organization accounts
                    },
                },
            })
        );

        /*
        (delegationRole.node.defaultChild as iam.CfnRole).addPropertyOverride('AssumeRolePolicyDocument', {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Deny',
                    Action: 'sts:AssumeRole',
                    Principal: { AWS: '*' },
                    Condition: {
                        StringNotEquals: {
                            'aws:PrincipalOrgId': organizationId, // Restrict to organization accounts
                        },
                        ArnLike: {
                            'aws:PrincipalArn': 'arn:aws:iam::*:role/DxDnsStack*'
                        }
                    },
                },
                {
                    Effect: 'Allow',
                    Action: 'sts:AssumeRole',
                    Principal: { Service: 'sts.amazonaws.com' },
                },
            ],
        });



        /*

            new iam.PolicyStatement({
                effect: iam.Effect.DENY,
                actions: ['sts:AssumeRole'],
                principals: [new iam.AnyPrincipal()],
                conditions: {
                    StringNotEquals: {
                        'aws:PrincipalOrgId': organizationId, // Restrict to organization accounts
                    },
                },
            })
        )

        // This denies access unless the principal is a member of the organization
        delegationRole.assumeRolePolicy?.addStatements(
            new iam.PolicyStatement({
                effect: iam.Effect.DENY,
                actions: ['sts:AssumeRole'],
                principals: [new iam.AnyPrincipal()],
                conditions: {
                    StringNotEquals: {
                        'aws:PrincipalOrgId': organizationId, // Restrict to organization accounts
                    },
                },
            })
        );
         */

        // Grant permissions to modify records in the root hosted zone
        delegationRole.addToPolicy(new iam.PolicyStatement({
            actions: [
                'route53:ChangeResourceRecordSets',
                'route53:GetChange',
                'route53:GetHostedZone',
                'route53:ListResourceRecordSets',
            ],
            resources: [
                'arn:aws:route53:::hostedzone/' + hostedZoneId, // Root hosted zone
            ],
        }));

        /*
        {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Deny",
                    "Principal": {
                        "AWS": "*"
                    },
                    "Action": "sts:AssumeRole",
                    "Condition": {
                        "StringNotEquals": {
                            "aws:PrincipalOrgID": "o-abcd12efg1"
                        },
                        "Bool": {
                            "aws:PrincipalIsAWSService": "false"
                        }
                    }
                }
            ]
        }
         */


        /*
        delegationRole.assumeRolePolicy?.addStatements(
            new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['sts:AssumeRole'],
                principals: [new iam.AnyPrincipal()],
                conditions: {
                    StringEquals: {
                        'aws:PrincipalOrgId': organizationId, // Restrict to organization accounts
                    },
                },
            })
        );

         */

    }
}