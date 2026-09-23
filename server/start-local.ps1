$ErrorActionPreference = 'Stop'

$securePassword = Read-Host 'Enter PostgreSQL password for user postgres' -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
  $env:PGHOST = if ($env:PGHOST) { $env:PGHOST } else { 'localhost' }
  $env:PGPORT = if ($env:PGPORT) { $env:PGPORT } else { '5432' }
  $env:PGUSER = if ($env:PGUSER) { $env:PGUSER } else { 'postgres' }
  $env:PGDATABASE = if ($env:PGDATABASE) { $env:PGDATABASE } else { 'queueflow_dev' }
  $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)

  if ([string]::IsNullOrWhiteSpace($env:PGPASSWORD)) {
    throw 'No PostgreSQL password was entered'
  }

  node (Join-Path $PSScriptRoot 'index.js')
}
finally {
  $env:PGPASSWORD = $null
  if ($passwordPtr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
  }
}

