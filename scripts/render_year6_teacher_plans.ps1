$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$lessonRoot = Join-Path $projectRoot 'public\lessons\year-6-maths\autumn'
$outputRoot = Join-Path $projectRoot '.qa\year6-teacher-plan-render'
New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
$plans = Get-ChildItem -LiteralPath $lessonRoot -Filter 'editable-teacher-plan.docx' -Recurse | Sort-Object FullName
if ($plans.Count -ne 50) { throw "Expected 50 teacher plans but found $($plans.Count)." }

$word = $null
$summary = @()
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  foreach ($plan in $plans) {
    $relative = $plan.FullName.Substring($lessonRoot.Length).TrimStart('\')
    $lessonName = Split-Path -Leaf (Split-Path -Parent $relative)
    $weekName = Split-Path -Leaf (Split-Path -Parent (Split-Path -Parent $relative))
    $targetDir = Join-Path $outputRoot "$weekName\$lessonName"
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    $pdfPath = Join-Path $targetDir 'teacher-plan.pdf'
    $document = $null
    try {
      $document = $word.Documents.Open($plan.FullName, $false, $true, $false)
      $pages = $document.ComputeStatistics(2)
      $document.ExportAsFixedFormat($pdfPath, 17)
      $summary += [pscustomobject]@{ Path = $relative; Pages = $pages; Pdf = $pdfPath }
    } finally {
      if ($document) {
        $document.Close($false)
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document)
      }
    }
  }
} finally {
  if ($word) {
    $word.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

$bad = @($summary | Where-Object { $_.Pages -ne 1 })
$summary | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $outputRoot 'summary.json') -Encoding UTF8
if ($bad.Count) {
  $bad | Format-Table -AutoSize | Out-String | Write-Error
  throw "$($bad.Count) teacher plans are not one page."
}
Write-Output "Rendered and checked $($summary.Count) one-page teacher plans."

