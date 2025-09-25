# DxAws CDK Component Library v1.0.17

This is a package of CDK components that are part of the DxAws ecosystem.  The main goal here is to provide a set of CDK L3 constructs which can be used to build complex systems with a few very high level commands.  A simple  example of this might be to build a static website by just providing a hostname for the site.  

## The Makefile

Going a little bit old school with this package using Makefiles to build and test the package as opposed to more commonly used npm/yarn etc.  The reason for this is that the package.

You should explore the contents of this project. It demonstrates a CDK Construct Library that includes a construct (`DxawsCdk`)
which contains an Amazon SQS queue that is subscribed to an Amazon SNS topic.

The construct defines an interface (`DxawsCdkProps`) to configure the visibility timeout of the queue.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests


## Dev workflow

If you are using this library with something else, you will need to build and
share this library everytime you make a change.  The following command helps
out here a bit:
```
make build && npm run publish:local
```
