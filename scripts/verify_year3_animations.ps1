param([string]$Root='.qa/year3-maths')
$ErrorActionPreference='Stop'
$rootPath=(Resolve-Path $Root).Path
$app=New-Object -ComObject PowerPoint.Application
$checks=@()
try {
 foreach($dir in Get-ChildItem (Join-Path $rootPath 'build') -Directory){
  $file=Join-Path $dir.FullName 'animated-candidate.pptx'
  $m=Get-Content (Join-Path $dir.FullName 'manifest.json') -Raw | ConvertFrom-Json
  $deck=$app.Presentations.Open($file,0,0,0)
  try {
   $count=0
   foreach($entry in $m.slides){
    $actual=$deck.Slides.Item([int]$entry.slide).TimeLine.MainSequence.Count
    if($actual -ne $entry.events.Count){throw "$($m.id) slide $($entry.slide): expected $($entry.events.Count), got $actual animations"}
    for($eventIndex=0;$eventIndex -lt $entry.events.Count;$eventIndex++){
     $trigger=$deck.Slides.Item([int]$entry.slide).TimeLine.MainSequence.Item($eventIndex+1).Timing.TriggerType
     if($trigger -ne [int]$entry.events[$eventIndex].trigger){throw "$($m.id) slide $($entry.slide) event $eventIndex has the wrong click trigger"}
    }
    $count+=$actual
   }
   $checks+=@{id=$m.id;slides=$deck.Slides.Count;effects=$count;triggersVerified=$true;sha256=(Get-FileHash $file -Algorithm SHA256).Hash.ToLowerInvariant()}
   Write-Output "VERIFIED $($m.id) $count effects"
  } finally {$deck.Close()}
 }
} finally {$app.Quit()}
ConvertTo-Json -InputObject @($checks) -Depth 5 | Set-Content (Join-Path $rootPath 'native-animation-validation.json')
