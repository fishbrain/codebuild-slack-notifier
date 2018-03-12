import { Handler, Context, Callback } from 'aws-lambda';

/**
 * See https://docs.aws.amazon.com/codebuild/latest/userguide/sample-build-notifications.html#sample-build-notifications-ref
 */
interface CodeBuildEvent {
  version: string;
  id: string;
  'detail-type': string;
  source: 'aws.codebuild';
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    'build-status':
      | 'SUCCEEDED'
      | 'TIMED_OUT'
      | 'STOPPED'
      | 'FAILED'
      | 'SUCCEEDED'
      | 'FAULT'
      | 'CLIENT_ERROR';
    'project-name': string;
    'build-id': string;
    'additional-information': {
      artifact?: {
        md5sum: string;
        sha256sum: string;
        location: string;
      };
      environment: {
        image: string;
        'privileged-mode': boolean;
        'compute-type':
          | 'BUILD_GENERAL1_SMALL'
          | 'BUILD_GENERAL1_MEDIUM'
          | 'BUILD_GENERAL1_LARGE';
        type: 'LINUX_CONTAINER';
        'environment-variables': any[]; // FIXME
      };
      'timeout-in-minutes': number;
      'build-complete': boolean;
      initiator: string;
      'build-start-time': string;
      source: {
        location: string;
        type: 'S3' | string; // FIXME
      };
      logs: {
        'group-name': string;
        'stream-name': string;
        'deep-link': string;
      };
      phases: any[]; //FIXME
    };
  };
}

export const handler: Handler = async (
  event: CodeBuildEvent,
  _context: Context,
  callback: Callback | undefined,
) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if (callback != null) {
    callback(null, 'Finished');
  }
};
