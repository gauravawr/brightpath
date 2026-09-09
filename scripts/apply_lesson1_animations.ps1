$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$sourcePath = Join-Path $projectRoot '.qa\lesson1-finalizer\base-output\lesson1-v5-base.pptx'
$candidatePath = Join-Path $projectRoot '.qa\lesson1-finalizer\lesson1-v5-animated-candidate.pptx'

if (-not (Test-Path -LiteralPath $sourcePath)) {
  throw "Base presentation was not found: $sourcePath"
}

Copy-Item -LiteralPath $sourcePath -Destination $candidatePath -Force

$powerPoint = $null
$presentation = $null

function Add-AppearEffect {
  param(
    [Parameter(Mandatory = $true)] $Slide,
    [Parameter(Mandatory = $true)] [string[]] $ShapeNames
  )

  $existingNames = @($ShapeNames | Where-Object {
    try {
      $null = $Slide.Shapes.Item($_)
      $true
    } catch {
      $false
    }
  })

  if ($existingNames.Count -eq 0) { return }

  for ($index = 0; $index -lt $existingNames.Count; $index++) {
    $target = $Slide.Shapes.Item($existingNames[$index])
    # 1 = Appear; first shape starts on click, the rest appear with it.
    $trigger = if ($index -eq 0) { 1 } else { 2 }
    $null = $Slide.TimeLine.MainSequence.AddEffect($target, 1, 0, $trigger)
  }
}

try {
  $powerPoint = New-Object -ComObject PowerPoint.Application
  $presentation = $powerPoint.Presentations.Open($candidatePath, $false, $false, $false)

  # Definition, modelled example, misconception, then the conclusion.
  $slide = $presentation.Slides.Item(2)
  Add-AppearEffect $slide @('Rounded Rectangle 9', 'Rectangle 10')
  Add-AppearEffect $slide @('Rounded Rectangle 11', 'Rounded Rectangle 12', 'Rectangle 13', 'Rounded Rectangle 14', 'Rounded Rectangle 15', 'Rectangle 16', 'Oval 17', 'Rectangle 18', 'Oval 19', 'Rectangle 20')
  Add-AppearEffect $slide @('Rounded Rectangle 21', 'Rounded Rectangle 22', 'Rectangle 23', 'Oval 24', 'Rectangle 25', 'Isosceles Triangle 26')
  Add-AppearEffect $slide @('Rectangle 27')

  # Four teaching steps, revealed one by one, followed by the reminder.
  $slide = $presentation.Slides.Item(6)
  Add-AppearEffect $slide @('Rounded Rectangle 9', 'Rounded Rectangle 10', 'Rectangle 11', 'Oval 12', 'Rectangle 13')
  Add-AppearEffect $slide @('Rounded Rectangle 14', 'Rounded Rectangle 15', 'Rectangle 16', 'Oval 17', 'Rectangle 18')
  Add-AppearEffect $slide @('Rounded Rectangle 19', 'Rounded Rectangle 20', 'Rectangle 21', 'Oval 22', 'Rectangle 23')
  Add-AppearEffect $slide @('Rounded Rectangle 24', 'Rounded Rectangle 25', 'Rectangle 26', 'Oval 27', 'Rectangle 28')
  Add-AppearEffect $slide @('Rounded Rectangle 29', 'Rectangle 30')

  # Objects appear one at a time before the class chooses the rule.
  $slide = $presentation.Slides.Item(7)
  foreach ($shapeName in @('Oval 15', 'Rectangle 16', 'Isosceles Triangle 17', 'Oval 18', 'Rectangle 19', 'Isosceles Triangle 20')) {
    Add-AppearEffect $slide @($shapeName)
  }
  Add-AppearEffect $slide @('Rectangle 21')

  # Assessment objects first; question appears after pupils have observed them.
  $slide = $presentation.Slides.Item(11)
  foreach ($shapeName in @('Oval 15', 'Oval 16', 'Rectangle 17', 'Rectangle 18')) {
    Add-AppearEffect $slide @($shapeName)
  }
  Add-AppearEffect $slide @('Rectangle 19')

  # Exit questions appear one at a time, then the final self-check.
  $slide = $presentation.Slides.Item(15)
  Add-AppearEffect $slide @('Rounded Rectangle 10', 'Rectangle 11')
  Add-AppearEffect $slide @('Rounded Rectangle 12', 'Rectangle 13')
  Add-AppearEffect $slide @('Rounded Rectangle 14', 'Rectangle 15')
  Add-AppearEffect $slide @('Rounded Rectangle 16', 'Rectangle 17')

  $presentation.Save()
} finally {
  if ($presentation) {
    $presentation.Close()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation)
  }
  if ($powerPoint) {
    $powerPoint.Quit()
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint)
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output $candidatePath
