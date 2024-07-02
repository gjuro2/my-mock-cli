
#CONFIG
$ErrorActionPreference = "Stop"
$tAppName ="my-mock-cli"
$tProjectFolder = "/home/dev/xoffice/my-mock-cli"

cd $tProjectFolder
Write-Host "Publish START $tAppName"
#VERSION PROMPT *************************************************************
node version-prompt.js
if ( $LASTEXITCODE -ne 0 ) {
      Write-Host "Version error" -ForegroundColor Red
      exit
 }

#PUBLISH *******************************************************************
npm publish --access=public
if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Build error" -ForegroundColor Red
    exit
}

Write-Host "Publish finished!"
