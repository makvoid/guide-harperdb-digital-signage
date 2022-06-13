# Introduction
This repository holds the code for a Digital Signage project using HarperDB Custom Functions, Angular as a frontend and Puppeteer to display remote web resources. This system is designed to be ran on a microcomputer, like the Raspberry Pi and uses as little of resources as possible when displaying the signs. I recommend following the article I've written about this project, which you can find linked below as it contains some additional context.

[Article Link](https://www.example.com)

# Requirements
* NodeJS v12+

# Components
## Custom Functions
Custom Functions package containing the routes and helpers required for execution. During deployment, the Frontend will also get packaged and deployed with the Custom Functions.

## Frontend
Angular 13 frontend allowing Administrators to login and manage Devices and the sign assignments each Device is tasked with. This gets packaged up and deployed with the Custom Functions.

## User Interface
Puppeteer wrapper which communicates with the Custom Functions endpoint to receive updated tasks and upload logs as needed. Designed to be ran on the embedded device.

## Scripts
Helper scripts used to streamline some required actions.
