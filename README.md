# codebuild-slack-notifier

AWS lambda function to send Slack notifications for CodeBuild events

## install

A valid Slack oauth token needs to be stored as a secure string in the SSM parameter store as `/codebuild-slack-notifier/SLACK_TOKEN`.

Then run

```shell
npm install
npm run deploy
```

With AWS credentials that have access to read from SSM and deploy a lambda.
