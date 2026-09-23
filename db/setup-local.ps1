$ErrorActionPreference = 'Stop'

$psqlPath = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'
$databaseName = 'queueflow_dev'
$schemaPath = Join-Path $PSScriptRoot 'queueflow_schema.sql'

if (-not (Test-Path -LiteralPath $psqlPath)) {
  throw "ไม่พบ psql ที่ $psqlPath"
}

if (-not (Test-Path -LiteralPath $schemaPath)) {
  throw "ไม่พบไฟล์ schema ที่ $schemaPath"
}

$securePassword = Read-Host 'Enter PostgreSQL password for user postgres' -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
  # Keep the password in memory only for this process. It is never written to disk.
  $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)
  if ([string]::IsNullOrWhiteSpace($env:PGPASSWORD)) {
    throw 'No PostgreSQL password was entered'
  }

  & $psqlPath -w -h localhost -U postgres -d postgres -v ON_ERROR_STOP=1 -q -c 'SELECT 1;' | Out-Null
  $connectionExitCode = $LASTEXITCODE
  if ($connectionExitCode -ne 0) {
    throw 'PostgreSQL connection failed. Check the password and service status.'
  }

  $existsOutput = & $psqlPath -w -h localhost -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$databaseName';"
  $existsExitCode = $LASTEXITCODE
  if ($existsExitCode -ne 0) {
    throw 'Could not check whether the development database already exists'
  }
  $exists = (@($existsOutput) -join "`n").Trim()

  if ($exists -ne '1') {
    & $psqlPath -w -h localhost -U postgres -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE $databaseName;"
    $createExitCode = $LASTEXITCODE
    if ($createExitCode -ne 0) {
      throw 'Could not create the queueflow_dev database'
    }
    Write-Host 'Created database queueflow_dev' -ForegroundColor Green
  } else {
    Write-Host 'Database queueflow_dev already exists; skipped creation' -ForegroundColor Yellow
  }

  & $psqlPath -w -h localhost -U postgres -d $databaseName -v ON_ERROR_STOP=1 -f $schemaPath
  $schemaExitCode = $LASTEXITCODE
  if ($schemaExitCode -ne 0) {
    throw 'Could not apply the QueueFlow schema'
  }

  Write-Host 'QueueFlow schema applied successfully' -ForegroundColor Green
  Write-Host 'No Google Sheets data or real queue data was imported' -ForegroundColor Cyan
}
finally {
  $env:PGPASSWORD = $null
  if ($passwordPtr -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
  }
}
