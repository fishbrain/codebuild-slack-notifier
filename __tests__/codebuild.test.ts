import {
  CodeBuildEvent,
  CodeBuildPhaseEvent,
  projectLink,
  buildPhaseAttachment,
  buildId,
  timeString,
} from '../codebuild';

const mockStateEvent: CodeBuildEvent = {
  version: '0',
  id: 'c030038d-8c4d-6141-9545-00ff7b7153EX',
  'detail-type': 'CodeBuild Build State Change',
  source: 'aws.codebuild',
  account: '123456789012',
  time: '2017-09-01T16:14:28Z',
  region: 'us-west-2',
  resources: [
    'arn:aws:codebuild:us-west-2:123456789012:build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX',
  ],
  detail: {
    'build-status': 'SUCCEEDED',
    'project-name': 'my-sample-project',
    'build-id':
      'arn:aws:codebuild:us-west-2:123456789012:build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX',
    'additional-information': {
      artifact: {
        md5sum: 'da9c44c8a9a3cd4b443126e823168fEX',
        sha256sum:
          '6ccc2ae1df9d155ba83c597051611c42d60e09c6329dcb14a312cecc0a8e39EX',
        location:
          'arn:aws:s3:::codebuild-123456789012-output-bucket/my-output-artifact.zip',
      },
      environment: {
        image: 'aws/codebuild/dot-net:1.1',
        'privileged-mode': false,
        'compute-type': 'BUILD_GENERAL1_SMALL',
        type: 'LINUX_CONTAINER',
        'environment-variables': [],
      },
      'timeout-in-minutes': 60,
      'build-complete': true,
      initiator: 'MyCodeBuildDemoUser',
      'build-start-time': 'Sep 1, 2017 4:12:29 PM',
      source: {
        location: 'codebuild-123456789012-input-bucket/my-input-artifact.zip',
        type: 'S3',
      },
      logs: {
        'group-name': '/aws/codebuild/my-sample-project',
        'stream-name': '8745a7a9-c340-456a-9166-edf953571bEX',
        'deep-link':
          'https://console.aws.amazon.com/cloudwatch/home?region=us-west-2#logEvent:group=/aws/codebuild/my-sample-project;stream=8745a7a9-c340-456a-9166-edf953571bEX',
      },
      phases: [
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:12:29 PM',
          'end-time': 'Sep 1, 2017 4:12:29 PM',
          'duration-in-seconds': 0,
          'phase-type': 'SUBMITTED',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:12:29 PM',
          'end-time': 'Sep 1, 2017 4:13:05 PM',
          'duration-in-seconds': 36,
          'phase-type': 'PROVISIONING',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:05 PM',
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'duration-in-seconds': 4,
          'phase-type': 'DOWNLOAD_SOURCE',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:10 PM',
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'duration-in-seconds': 0,
          'phase-type': 'INSTALL',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:10 PM',
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'duration-in-seconds': 0,
          'phase-type': 'PRE_BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:13:10 PM',
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'duration-in-seconds': 70,
          'phase-type': 'BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:14:21 PM',
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'duration-in-seconds': 0,
          'phase-type': 'POST_BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:14:21 PM',
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'duration-in-seconds': 0,
          'phase-type': 'UPLOAD_ARTIFACTS',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [],
          'start-time': 'Sep 1, 2017 4:14:21 PM',
          'end-time': 'Sep 1, 2017 4:14:26 PM',
          'duration-in-seconds': 4,
          'phase-type': 'FINALIZING',
          'phase-status': 'SUCCEEDED',
        },
        {
          'start-time': 'Sep 1, 2017 4:14:26 PM',
          'phase-type': 'COMPLETED',
        },
      ],
    },
    'current-phase': 'COMPLETED',
    'current-phase-context': '[]',
    version: '1',
  },
};

const mockPhaseEvent: CodeBuildPhaseEvent = {
  version: '0',
  id: 'ab4ec3f1-5058-a600-ce26-a9bb30f6e907',
  'detail-type': 'CodeBuild Build Phase Change',
  source: 'aws.codebuild',
  account: '750437945299',
  time: '2018-08-07T10:58:28Z',
  region: 'eu-west-1',
  resources: [
    'arn:aws:codebuild:eu-west-1:750437945299:build/rutilus:046f6813-1516-43ed-bdab-339f8fdc94af',
  ],
  detail: {
    'completed-phase': 'PRE_BUILD',
    'project-name': 'rutilus',
    'build-id':
      'arn:aws:codebuild:eu-west-1:750437945299:build/rutilus:046f6813-1516-43ed-bdab-339f8fdc94af',
    'completed-phase-context': '[: ]',
    'additional-information': {
      artifact: {
        location: '',
      },
      environment: {
        image: 'aws/codebuild/docker:17.09.0',
        'privileged-mode': true,
        'compute-type': 'BUILD_GENERAL1_LARGE',
        type: 'LINUX_CONTAINER',
        'environment-variables': [
          {
            name: 'IMAGE_REPO_NAME',
            type: 'PLAINTEXT',
            value: '750437945299.dkr.ecr.eu-west-1.amazonaws.com/fishbrain',
          },
          {
            name: 'SLACK_NOFITY_CHANNELS',
            type: 'PLAINTEXT',
            value: 'rutilus',
          },
        ],
      },
      'timeout-in-minutes': 60,
      'build-complete': false,
      initiator: 'GitHub-Hookshot/4f5b68a',
      'build-start-time': 'Aug 7, 2018 10:57:42 AM',
      source: {
        buildspec: '',
        auth: {
          type: 'OAUTH',
        },
        location: 'https://github.com/fishbrain/rutilus-api.git',
        type: 'GITHUB',
      },
      'source-version': 'd5b0159a3ce05a95d7f16055dab3e0ae3cae6cff',
      logs: {
        'group-name': '/aws/codebuild/rutilus',
        'stream-name': '046f6813-1516-43ed-bdab-339f8fdc94af',
        'deep-link':
          'https://console.aws.amazon.com/cloudwatch/home?region=eu-west-1#logEvent:group=/aws/codebuild/rutilus;stream=046f6813-1516-43ed-bdab-339f8fdc94af',
      },
      phases: [
        {
          'phase-context': [],
          'start-time': 'Aug 7, 2018 10:57:42 AM',
          'end-time': 'Aug 7, 2018 10:57:42 AM',
          'duration-in-seconds': 0,
          'phase-type': 'SUBMITTED',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [': '],
          'start-time': 'Aug 7, 2018 10:57:42 AM',
          'end-time': 'Aug 7, 2018 10:58:03 AM',
          'duration-in-seconds': 20,
          'phase-type': 'PROVISIONING',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [': '],
          'start-time': 'Aug 7, 2018 10:58:03 AM',
          'end-time': 'Aug 7, 2018 10:58:18 AM',
          'duration-in-seconds': 15,
          'phase-type': 'DOWNLOAD_SOURCE',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [': '],
          'start-time': 'Aug 7, 2018 10:58:18 AM',
          'end-time': 'Aug 7, 2018 10:58:28 AM',
          'duration-in-seconds': 9,
          'phase-type': 'INSTALL',
          'phase-status': 'SUCCEEDED',
        },
        {
          'phase-context': [': '],
          'start-time': 'Aug 7, 2018 10:58:28 AM',
          'end-time': 'Aug 7, 2018 11:07:20 AM',
          'duration-in-seconds': 532,
          'phase-type': 'PRE_BUILD',
          'phase-status': 'SUCCEEDED',
        },
        {
          'start-time': 'Aug 7, 2018 11:07:20 AM',
          'phase-type': 'BUILD',
        },
      ],
    },
    'completed-phase-status': 'SUCCEEDED',
    'completed-phase-duration-seconds': 532,
    version: '1',
    'completed-phase-start': 'Aug 7, 2018 10:58:28 AM',
    'completed-phase-end': 'Aug 7, 2018 11:07:20 AM',
  },
};

describe('projectLink', () => {
  it('gets the project link from event', () => {
    expect(projectLink(mockStateEvent)).toEqual(
      '<https://us-west-2.console.aws.amazon.com/codebuild/home?region=us-west-2#/projects/my-sample-project/view|my-sample-project>',
    );
  });
});

describe('timeString', () => {
  it('gets the build id from a state event', () => {
    expect(timeString(5)).toEqual('5s');
  });

  it('gets the build id from a phase event', () => {
    expect(timeString(125)).toEqual('2m5s');
  });
});

describe('buildId', () => {
  it('gets the build id from a state event', () => {
    expect(buildId(mockStateEvent)).toEqual(
      '8745a7a9-c340-456a-9166-edf953571bEX',
    );
  });

  it('gets the build id from a phase event', () => {
    expect(buildId(mockPhaseEvent)).toEqual(
      '046f6813-1516-43ed-bdab-339f8fdc94af',
    );
  });
});

describe('buildPhaseAttachment', () => {
  it('creates an attachment with all phases', () => {
    expect(buildPhaseAttachment(mockPhaseEvent)).toEqual({
      fallback: 'Current phase: BUILD',
      text:
        ':white_check_mark: PROVISIONING (20s) :white_check_mark: DOWNLOAD_SOURCE (15s) :white_check_mark: INSTALL (9s) :white_check_mark: PRE_BUILD (8m52s) :building_construction: BUILD',
      title: 'Build Phases',
    });
  });
});
