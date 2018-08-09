import { updateOrAddAttachment } from '../slack';

describe('updateOrAddAttachment', () => {
  const attachments = [
    {
      fallback:
        '<https://eu-west-1.console.aws.amazon.com/codebuild/home?region=eu-west-1#/builds/rutilus:5d0adb2e-518f-4d46-9368-f1b6a004c52a/view/new|Build> of <https://eu-west-1.console.aws.amazon.com/codebuild/home?region=eu-west-1#/projects/rutilus/view|rutilus> started',
      text:
        '<https://eu-west-1.console.aws.amazon.com/codebuild/home?region=eu-west-1#/builds/rutilus:5d0adb2e-518f-4d46-9368-f1b6a004c52a/view/new|Build> of <https://eu-west-1.console.aws.amazon.com/codebuild/home?region=eu-west-1#/projects/rutilus/view|rutilus> started',
      footer: '5d0adb2e-518f-4d46-9368-f1b6a004c52a',
      id: 1,
      color: '439FE0',
      fields: [
        {
          title: 'Git revision',
          value:
            '<https://github.com/fishbrain/rutilus-api/commit/ce149e858737e59f8183e6ece437f5574ff2fd07|ce149e858737e59f8183e6ece437f5574ff2fd07>',
          short: true,
        },
      ],
    },
    {
      fallback: 'Current phase: DOWNLOAD_SOURCE',
      text:
        ':white_check_mark: PROVISIONING (20s) :building_construction: DOWNLOAD_SOURCE',
      title: 'Build Phases',
      id: 2,
    },
  ];
  const newAttachment = {};

  it('updates first attachment that matches', () => {
    expect(
      updateOrAddAttachment(
        attachments,
        attachment => attachment.title === 'Build Phases',
        newAttachment,
      ),
    ).toEqual([attachments[0], newAttachment]);
  });

  it('updates adds an attachment if none matches', () => {
    expect(
      updateOrAddAttachment(
        attachments,
        attachment => attachment.title === 'Build Phases that do not exist',
        newAttachment,
      ),
    ).toEqual([...attachments, newAttachment]);
  });
});
