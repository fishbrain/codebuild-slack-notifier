import {
  buildId,
  buildPhaseAttachment,
  CodeBuildEvent,
  CodeBuildPhaseEvent,
  projectLink,
  timeString,
} from '../codebuild';

const mockStateEvent: CodeBuildEvent = {
  account: '123456789012',
  detail: {
    'additional-information': {
      artifact: {
        location:
          'arn:aws:s3:::codebuild-123456789012-output-bucket/my-output-artifact.zip',
        md5sum: 'da9c44c8a9a3cd4b443126e823168fEX',
        sha256sum:
          '6ccc2ae1df9d155ba83c597051611c42d60e09c6329dcb14a312cecc0a8e39EX',
      },
      'build-complete': true,
      'build-start-time': 'Sep 1, 2017 4:12:29 PM',
      environment: {
        'compute-type': 'BUILD_GENERAL1_SMALL',
        'environment-variables': [],
        image: 'aws/codebuild/dot-net:1.1',
        'privileged-mode': false,
        type: 'LINUX_CONTAINER',
      },
      initiator: 'MyCodeBuildDemoUser',
      logs: {
        'deep-link':
          'https://console.aws.amazon.com/cloudwatch/home?region=us-west-2#logEvent:group=/aws/codebuild/my-sample-project;stream=8745a7a9-c340-456a-9166-edf953571bEX',
        'group-name': '/aws/codebuild/my-sample-project',
        'stream-name': '8745a7a9-c340-456a-9166-edf953571bEX',
      },
      phases: [
        {
          'duration-in-seconds': 0,
          'end-time': 'Sep 1, 2017 4:12:29 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'SUBMITTED',
          'start-time': 'Sep 1, 2017 4:12:29 PM',
        },
        {
          'duration-in-seconds': 36,
          'end-time': 'Sep 1, 2017 4:13:05 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'PROVISIONING',
          'start-time': 'Sep 1, 2017 4:12:29 PM',
        },
        {
          'duration-in-seconds': 4,
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'DOWNLOAD_SOURCE',
          'start-time': 'Sep 1, 2017 4:13:05 PM',
        },
        {
          'duration-in-seconds': 0,
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'INSTALL',
          'start-time': 'Sep 1, 2017 4:13:10 PM',
        },
        {
          'duration-in-seconds': 0,
          'end-time': 'Sep 1, 2017 4:13:10 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'PRE_BUILD',
          'start-time': 'Sep 1, 2017 4:13:10 PM',
        },
        {
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'BUILD',
          'start-time': 'Sep 1, 2017 4:13:10 PM',
        },
        {
          'duration-in-seconds': 0,
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'POST_BUILD',
          'start-time': 'Sep 1, 2017 4:14:21 PM',
        },
        {
          'duration-in-seconds': 0,
          'end-time': 'Sep 1, 2017 4:14:21 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'UPLOAD_ARTIFACTS',
          'start-time': 'Sep 1, 2017 4:14:21 PM',
        },
        {
          'duration-in-seconds': 4,
          'end-time': 'Sep 1, 2017 4:14:26 PM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'FINALIZING',
          'start-time': 'Sep 1, 2017 4:14:21 PM',
        },
        {
          'phase-type': 'COMPLETED',
          'start-time': 'Sep 1, 2017 4:14:26 PM',
        },
      ],
      source: {
        location: 'codebuild-123456789012-input-bucket/my-input-artifact.zip',
        type: 'S3',
      },
      'timeout-in-minutes': 60,
    },
    'build-id':
      'arn:aws:codebuild:us-west-2:123456789012:build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX',
    'build-status': 'SUCCEEDED',
    'current-phase': 'COMPLETED',
    'current-phase-context': '[]',
    'project-name': 'my-sample-project',
    version: '1',
  },
  'detail-type': 'CodeBuild Build State Change',
  id: 'c030038d-8c4d-6141-9545-00ff7b7153EX',
  region: 'us-west-2',
  resources: [
    'arn:aws:codebuild:us-west-2:123456789012:build/my-sample-project:8745a7a9-c340-456a-9166-edf953571bEX',
  ],
  source: 'aws.codebuild',
  time: '2017-09-01T16:14:28Z',
  version: '0',
};

const mockPhaseEvent: CodeBuildPhaseEvent = {
  account: '750437945299',
  detail: {
    'additional-information': {
      artifact: {
        location: '',
      },
      'build-complete': false,
      'build-start-time': 'Aug 7, 2018 10:57:42 AM',
      environment: {
        'compute-type': 'BUILD_GENERAL1_LARGE',
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
        image: 'aws/codebuild/docker:17.09.0',
        'privileged-mode': true,
        type: 'LINUX_CONTAINER',
      },
      initiator: 'GitHub-Hookshot/4f5b68a',
      logs: {
        'deep-link':
          'https://console.aws.amazon.com/cloudwatch/home?region=eu-west-1#logEvent:group=/aws/codebuild/rutilus;stream=046f6813-1516-43ed-bdab-339f8fdc94af',
        'group-name': '/aws/codebuild/rutilus',
        'stream-name': '046f6813-1516-43ed-bdab-339f8fdc94af',
      },
      phases: [
        {
          'duration-in-seconds': 0,
          'end-time': 'Aug 7, 2018 10:57:42 AM',
          'phase-context': [],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'SUBMITTED',
          'start-time': 'Aug 7, 2018 10:57:42 AM',
        },
        {
          'duration-in-seconds': 20,
          'end-time': 'Aug 7, 2018 10:58:03 AM',
          'phase-context': [': '],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'PROVISIONING',
          'start-time': 'Aug 7, 2018 10:57:42 AM',
        },
        {
          'duration-in-seconds': 15,
          'end-time': 'Aug 7, 2018 10:58:18 AM',
          'phase-context': [': '],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'DOWNLOAD_SOURCE',
          'start-time': 'Aug 7, 2018 10:58:03 AM',
        },
        {
          'duration-in-seconds': 9,
          'end-time': 'Aug 7, 2018 10:58:28 AM',
          'phase-context': [': '],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'INSTALL',
          'start-time': 'Aug 7, 2018 10:58:18 AM',
        },
        {
          'duration-in-seconds': 532,
          'end-time': 'Aug 7, 2018 11:07:20 AM',
          'phase-context': [': '],
          'phase-status': 'SUCCEEDED',
          'phase-type': 'PRE_BUILD',
          'start-time': 'Aug 7, 2018 10:58:28 AM',
        },
        {
          'phase-type': 'BUILD',
          'start-time': 'Aug 7, 2018 11:07:20 AM',
        },
      ],
      source: {
        auth: {
          type: 'OAUTH',
        },
        buildspec: '',
        location: 'https://github.com/fishbrain/rutilus-api.git',
        type: 'GITHUB',
      },
      'source-version': 'd5b0159a3ce05a95d7f16055dab3e0ae3cae6cff',
      'timeout-in-minutes': 60,
    },
    'build-id':
      'arn:aws:codebuild:eu-west-1:750437945299:build/rutilus:046f6813-1516-43ed-bdab-339f8fdc94af',
    'completed-phase': 'PRE_BUILD',
    'completed-phase-context': '[: ]',
    'completed-phase-duration-seconds': 532,
    'completed-phase-end': 'Aug 7, 2018 11:07:20 AM',
    'completed-phase-start': 'Aug 7, 2018 10:58:28 AM',
    'completed-phase-status': 'SUCCEEDED',
    'project-name': 'rutilus',
    version: '1',
  },
  'detail-type': 'CodeBuild Build Phase Change',
  id: 'ab4ec3f1-5058-a600-ce26-a9bb30f6e907',
  region: 'eu-west-1',
  resources: [
    'arn:aws:codebuild:eu-west-1:750437945299:build/rutilus:046f6813-1516-43ed-bdab-339f8fdc94af',
  ],
  source: 'aws.codebuild',
  time: '2018-08-07T10:58:28Z',
  version: '0',
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
    const time = 5;
    expect(timeString(time)).toEqual('5s');
  });

  it('gets the build id from a phase event', () => {
    const time = 125;
    expect(timeString(time)).toEqual('2m5s');
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
