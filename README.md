# NestJS Bot Platform

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a><img src="https://cdn.pixabay.com/photo/2016/12/21/17/11/signe-1923369_960_720.png" alt="plus" width="100"><img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Big-bot-icon.svg" width ="140" alt="Robot Icon"/>
</p>

<h1 align="center">A <a href="http://nestjs.com" target="blank">NestJS</a> service wrapper for different JavaScript bot frameworks!
  </h1>
  <p align="center">
  <a href="http://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-brightgreen.svg"/></a>
  <a href="https://dependabot.com"><img src="https://api.dependabot.com/badges/status?host=github&repo=nest-bots/bot-platform"/></a>
  <a href="https://snyk.io/test/github/nest-bots/bot-platform?targetFile=package.json"><img src="https://snyk.io/test/github/nest-bots/bot-platform/badge.svg?targetFile=package.json"/></a>
</p>
<p align="center">
</p>

### Usage

> This module has to be used with one of the (not yet) supplied framework wrappers to be useful. The specific usage of these modules will be explained in the relevant README.md files. 

In general, every module can be used with a specific Bot Instance (supplied by the framework wrappers) and a framework-specific configuration:

```typescript
@Module({
  imports: [BotModule.forRoot(BotInstance /* e.g. DiscordBot */, {
    // Some Framework specific configuration details
  })],
})
```

```typescript
@Module({
  imports: [BotModule.forRootAsync(BotInstance /* e.g. DiscordBot */, {
    useFactory: async (configService: ConfigService) => {
      return { 
        // Some Framework specific configuration details using the ConfigService
      };
    inject: [ConfigService]
  })],
})
```

### Registering Events

> Make sure that all EventHandler classes are registered as providers

All events are registered using the `@Bot.Event` Decorator. The first parameter should be the framework-specific Bot Instance, the second always specifies the type of event; all events are listen in the Events enum of the Instance.

```typescript
@Injectable()
@Bot.Event(BotInstance /* e.g. DiscordBot */, BotInstance.Events.Message)
export class MessageEvent implements BotEventHandler<BotInstance> {

    constructor() {}

    handle(...args: any[]) {

    }

}
```

The arguments of the handle-function are determined by the kind of event as well as the framework. The first parameter is always the framework-specific Client Instance
