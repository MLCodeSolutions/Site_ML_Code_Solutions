$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "tools\archive\prints-jpg"
$prints = Join-Path $root "assets\img\prints"
New-Item -ItemType Directory -Force -Path $prints | Out-Null
$files = Get-ChildItem -LiteralPath $source -Filter "*.jpg" | Where-Object { $_.Name -notlike "*-600.jpg" -and $_.Name -notlike "*-1200.jpg" }
$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$done = 0

foreach ($file in $files) {
  $base = [IO.Path]::GetFileNameWithoutExtension($file.Name)
  $small = Join-Path $prints ($base + "-600.webp")
  $large = Join-Path $prints ($base + "-1200.webp")

  if (-not (Test-Path $small)) {
    & $ffmpeg -hide_banner -loglevel error -y -i $file.FullName -vf "scale=600:-2" -c:v libwebp -quality 72 -compression_level 6 $small
  }
  if (-not (Test-Path $large)) {
    & $ffmpeg -hide_banner -loglevel error -y -i $file.FullName -vf "scale=1200:-2" -c:v libwebp -quality 72 -compression_level 6 $large
  }
  $done++
  Write-Host "[$done/$($files.Count)] $base"
}

Write-Host "WebP gerados: $($files.Count * 2)"
