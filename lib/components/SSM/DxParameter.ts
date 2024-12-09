import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

// Add type for parameter value
export interface ParameterValue {
    value: string;
    description?: string;
    secure?: boolean;  // Flag for secure strings
}

export interface DxParameterProps {
    system: string;
    parameters: Record<string, ParameterValue>;
}

export class DxParameter extends Construct {
    private readonly parameters: Record<string, ssm.IStringParameter> = {};
    private readonly system: string;

    constructor(scope: Construct, id: string, props: DxParameterProps) {
        super(scope, id);

        // Validate system name
        if (!props.system || props.system.trim() === '') {
            throw new Error('System name is required');
        }
        this.system = props.system;

        // Validate parameters
        if (!props.parameters || Object.keys(props.parameters).length === 0) {
            throw new Error('At least one parameter is required');
        }

        // Create parameters
        Object.entries(props.parameters).forEach(([name, paramValue]) => {
            // Validation
            if (!name || name.trim() === '') {
                throw new Error('Parameter name cannot be empty');
            }
            if (!paramValue.value || paramValue.value.trim() === '') {
                throw new Error(`Value for parameter ${name} cannot be empty`);
            }

            const fullParameterName = `/${this.system}/${name}`;

            this.parameters[name] = new ssm.StringParameter(this, `Parameter-${name}`, {
                parameterName: fullParameterName,
                stringValue: paramValue.value,
                description: paramValue.description || `Created by ${this.system} stack`,
            });
        });
    }

    // Helper methods remain the same
    public getValue(parameterName: string): string {
        if (!this.parameters[parameterName]) {
            throw new Error(`Parameter ${parameterName} not found in system ${this.system}`);
        }
        return this.parameters[parameterName].stringValue;
    }

    public get parameterNames(): string[] {
        return Object.keys(this.parameters);
    }

    public getParameterPath(parameterName: string): string {
        if (!this.parameters[parameterName]) {
            throw new Error(`Parameter ${parameterName} not found in system ${this.system}`);
        }
        return `/${this.system}/${parameterName}`;
    }
}