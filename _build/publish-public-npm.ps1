
#CONFIG
$ErrorActionPreference = "Stop"
$tAppName ="my-mock-cli"
$tProjectFolder = "/home/dev/xoffice/my-mock-cli"

cd $tProjectFolder
#VERSION PROMPT *************************************************************
Write-Host "Version START $tAppName"
node version-prompt.js
if ( $LASTEXITCODE -ne 0 ) {
      Write-Host "Version error" -ForegroundColor Red
      exit
 }
npx genversion --esm --semi --property name,version src/version.ts

#CLEAN && REBUILD *************************************************************
Write-Host "Rebuild START $tAppName"
Remove-Item -Path "$tProjectFolder/bin" -Recurse -ErrorAction Ignore
npx tsc


#PUBLISH *******************************************************************
Write-Host "Publish START $tAppName"
npm publish --access=public
if ( $LASTEXITCODE -ne 0 ) {
    Write-Host "Build error" -ForegroundColor Red
    exit
}

Write-Host "Publish finished!"

