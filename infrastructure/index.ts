import * as pulumi from "@pulumi/pulumi";

// Import the configuration settings for the current stack.
const config = new pulumi.Config();
const appPath = config.require('appPath');
const prefixName = config.require('prefixName');
const imageName = prefixName;
const imageTag = config.require('imageTag');

// Azure container instances service does not support port mapping
// so, the containerPort and pubicPort must be the same
const containerPort = config.requireNumber('containerPort');
const publicPort = config.requireNumber('publicPort');
const cpu = config.requireNumber('cpu');
const memory = config.requireNumber('memory');

