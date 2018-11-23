# codebuild-slack-notifier

AWS Lambda to send Slack notifications for CodeBuild events.

## Install

A valid Slack oauth token needs to be stored as a secure string in the SSM parameter store as `/codebuild-slack-notifier/slack_token`.

Then run:

```shell
npm install
npm run deploy
```

With AWS credentials that have access to read from SSM and deploy a lambda.

## Configuration

Using `chamber`, you can set the corresponding Slack channel(s) for each codebuild project.

```
chamber write codebuild-slack-notifier {repository}_channels {slack_channel}
```
