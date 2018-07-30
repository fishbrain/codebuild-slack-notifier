/**
 * See https://docs.aws.amazon.com/codebuild/latest/userguide/sample-build-notifications.html#sample-build-notifications-ref
 */
export type CodeBuildPhase =
  | 'SUBMITTED'
  | 'PROVISIONING'
  | 'DOWNLOAD_SOURCE'
  | 'INSTALL'
  | 'PRE_BUILD'
  | 'BUILD'
  | 'POST_BUILD'
  | 'UPLOAD_ARTIFACTS'
  | 'FINALIZING'
  | 'COMPLETED';

export type CodeBuildStatus =
  | 'IN_PROGRESS'
  | 'SUCCEEDED'
  | 'TIMED_OUT'
  | 'STOPPED'
  | 'FAILED'
  | 'SUCCEEDED'
  | 'FAULT'
  | 'CLIENT_ERROR';

export interface CodeBuildEvent {
  version: string;
  id: string;
  'detail-type': string;
  source: 'aws.codebuild';
  account: string;
  time: string;
  region: string;
  resources: string[];
  detail: {
    'build-status': CodeBuildStatus;
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
        'environment-variables': {
          name: string;
          value: string;
          type: 'PLAINTEXT' | 'SSM';
        }[];
      };
      'timeout-in-minutes': number;
      'build-complete': boolean;
      initiator: string;
      'build-start-time': string;
      source: {
        buildspec?: string;
        auth?: {
          type: string; // can be 'OAUTH' and possibly other values
        };
        location: string;
        type: 'S3' | 'GITHUB';
      };
      'source-version'?: string;
      logs?: {
        'group-name': string;
        'stream-name': string;
        'deep-link': string;
      };
      phases: {
        'phase-context'?: string[];
        'start-time': string;
        'end-time'?: string;
        'duration-in-seconds'?: number;
        'phase-type': CodeBuildPhase;
        'phase-status'?: CodeBuildStatus;
      }[];
    };
    'current-phase': CodeBuildPhase;
    'current-phase-context': string;
    version: string;
  };
}
