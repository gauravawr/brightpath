param([string]$Root='.qa/year2-maths')
$ErrorActionPreference='Stop'
$resolved=(Resolve-Path -LiteralPath $Root).Path
$word=New-Object -ComObject Word.Application
$word.Visible=$false
$word.DisplayAlerts=0
$report=@()
try {
 foreach($dir in Get-ChildItem -LiteralPath (Join-Path $resolved 'resources') -Directory){
  $file=Join-Path $dir.FullName 'editable-teacher-plan.docx'
  if(-not(Test-Path -LiteralPath $file)){continue}
  $preview=Join-Path $dir.FullName 'preview'
  New-Item -ItemType Directory -Path $preview -Force | Out-Null
  $doc=$word.Documents.Open($file,$false,$true,$false)
  try {
   $pages=$doc.ComputeStatistics(2)
   $doc.ExportAsFixedFormat((Join-Path $preview 'teacher-plan.pdf'),17)
   $report+=@{id=$dir.Name;pages=$pages}
  } finally {$doc.Close($false);[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc)}
  Write-Output "RENDERED $($dir.Name) $pages pages"
 }
} finally {$word.Quit();[void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)}
$report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $resolved 'teacher-plan-render-report.json') -Encoding UTF8
