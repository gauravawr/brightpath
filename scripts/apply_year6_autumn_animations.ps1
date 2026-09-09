param([string]$Only = '')

$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$stageRoot = Join-Path $projectRoot '.qa\year6-autumn-pptx'
$allCandidates = Get-ChildItem -LiteralPath $stageRoot -Filter 'candidate.pptx' -Recurse | Sort-Object FullName
if ($allCandidates.Count -ne 50) {
  throw "Expected 50 Year 6 candidates but found $($allCandidates.Count)."
}
$candidates = if ($Only) { $allCandidates | Where-Object FullName -Like "*\$Only\candidate.pptx" } else { $allCandidates }
if ($Only -and $candidates.Count -ne 1) { throw "Expected one candidate for $Only but found $($candidates.Count)." }

$powerPoint = $null
try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  foreach ($candidate in $candidates) {
    $outputPath = Join-Path $candidate.DirectoryName 'animated-candidate.pptx'
    Copy-Item -LiteralPath $candidate.FullName -Destination $outputPath -Force
    $presentation = $null
    try {
      $presentation = $powerPoint.Presentations.Open($outputPath, $false, $false, $false)
      foreach ($slide in $presentation.Slides) {
        foreach ($shape in $slide.Shapes) {
          if ($shape.HasTextFrame -ne -1 -or $shape.TextFrame.HasText -ne -1) { continue }
          $value = [string]$shape.TextFrame.TextRange.Text
          if (-not $value.StartsWith('[[CLICK]]')) { continue }
          $shape.TextFrame.TextRange.Text = ($value -replace '^\[\[CLICK\]\]\s*', '')
          # Appear on page click. Each marked teaching point advances separately.
          $null = $slide.TimeLine.MainSequence.AddEffect($shape, 1, 0, 1)
        }
      }
      $presentation.Save()
    } finally {
      if ($presentation) {
        $presentation.Close()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
      }
    }
    Write-Output $outputPath
  }
} finally {
  if ($powerPoint) {
    $powerPoint.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
