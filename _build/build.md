# NPM
- https://www.npmjs.com/package/@gjuro/my-mock-cli

# BUILD
- npx genversion --esm --semi --property name,version src/version.js
- npx tsc

# RUN
node .
node . samples/log-sample.json

# node
https://developer.okta.com/blog/2019/06/18/command-line-app-with-nodejs

# typescript
https://betterstack.com/community/guides/scaling-nodejs/nodejs-typescript/
https://medium.com/@induwara99/a-step-by-step-guide-to-setting-up-a-node-js-project-with-typescript-6df4481cb335
https://stackoverflow.com/questions/37260901/how-to-find-module-fs-in-vs-code-with-typescript

## typescript buld
- npx tsc
- npx tsc --version

## debug
- https://blog.logrocket.com/how-to-debug-node-js-apps-in-visual-studio-code/

# publish to NPM
https://www.freecodecamp.org/news/how-to-create-and-publish-your-first-npm-package/

- npm login
- npm publish --access=public

## install globaly on local environemnt
- npm install -g .
- my-mock-cli
- npm uninstall -g my-mock-cli

- npm list -g

# versioning
- https://www.npmjs.com/package/genversion
- npm install version --save-dev
- npm install prompt --save-dev
-
# AUTOMATION
- settings in nodemon.js

## automatic recompile NODEMON
- npx tsc --watch
## automatic recompile no file replacement
- npx tsc --watch --noEmit NODEMON

## VS CODE TASK TO START AUTOMATICALY
- https://frontendmasters.com/blog/vs-code-auto-run-commands/
- https://code.visualstudio.com/docs/editor/tasks
- https://stackoverflow.com/questions/63177146/how-to-create-tasks-for-a-vscode-workspace
- https://sdivakarrajesh.medium.com/automating-task-to-run-on-startup-in-vscode-fe30d7f99454
