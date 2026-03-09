$ErrorActionPreference = 'Stop'

$packageArgs = @{
  packageName   = 'tsarr'
  url64bit      = "https://github.com/robbeverhelst/tsarr/releases/download/v$($env:ChocolateyPackageVersion)/tsarr-windows-x64.exe"
  fileFullPath  = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)\tsarr.exe"
  checksum64    = ''
  checksumType64= 'sha256'
}

Get-ChocolateyWebFile @packageArgs
