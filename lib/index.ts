// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface DxawsCdkProps {
  // Define construct properties here
}

export class DxawsCdk extends Construct {

  constructor(scope: Construct, id: string, props: DxawsCdkProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'DxawsCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
