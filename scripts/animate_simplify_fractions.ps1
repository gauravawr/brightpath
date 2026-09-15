param([Parameter(Mandatory=$true)][string]$BuildDirectory)
$ErrorActionPreference = 'Stop'
$build = (Resolve-Path -LiteralPath $BuildDirectory).Path
$source = Join-Path $build 'candidate.pptx'
$output = Join-Path $build 'animated-candidate.pptx'
$manifest = Get-Content -LiteralPath (Join-Path $build 'animation.json') -Raw | ConvertFrom-Json
Copy-Item -LiteralPath $source -Destination $output -Force
$powerPoint = New-Object -ComObject PowerPoint.Application
try {
  $presentation = $powerPoint.Presentations.Open($output, 0, 0, 0)
  try {
    foreach ($entry in $manifest) {
      $slide = $presentation.Slides.Item([int]$entry.slide)
      foreach ($item in $entry.events) {
        $shape = $slide.Shapes.Item([string]$item.name)
        if ($item.type -eq 'move') {
          # Start with a path effect, not Custom (which PowerPoint treats as an entrance).
          $effect = $slide.TimeLine.MainSequence.AddEffect($shape, 149, 0, [int]$item.trigger)
          $motion = $effect.Behaviors.Item(1)
          $dx = ([double]$item.dx / 1280).ToString('0.########', [Globalization.CultureInfo]::InvariantCulture)
          $dy = ([double]$item.dy / 720).ToString('0.########', [Globalization.CultureInfo]::InvariantCulture)
          $motion.MotionEffect.Path = "M 0 0 L $dx $dy E"
          $effect.Timing.Duration = [double]$item.duration
          $effect.Timing.Accelerate = 0.15
          $effect.Timing.Decelerate = 0.15
        } else {
          $effect = $slide.TimeLine.MainSequence.AddEffect($shape, 1, 0, [int]$item.trigger)
        }
      }
    }
    $presentation.Save()
    Write-Output "Animated $($presentation.Slides.Count) slides: $output"
  } finally { $presentation.Close() }
} finally { $powerPoint.Quit() }
