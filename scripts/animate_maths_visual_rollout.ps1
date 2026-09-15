param([Parameter(Mandatory=$true)][string]$BuildRoot,[string[]]$Only=@(),[switch]$SkipExisting)
$ErrorActionPreference='Stop'
$root=(Resolve-Path -LiteralPath $BuildRoot).Path
$powerPoint=New-Object -ComObject PowerPoint.Application
try {
 foreach($dir in (Get-ChildItem -LiteralPath $root -Directory)) {
  $manifestPath=Join-Path $dir.FullName 'manifest.json'
  if(-not(Test-Path -LiteralPath $manifestPath)){continue}
  $m=Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
  if($Only.Count -and $m.id -notin $Only){continue}
  $output=Join-Path $dir.FullName 'animated-candidate.pptx'
  if($SkipExisting -and (Test-Path -LiteralPath $output)){continue}
  Copy-Item -LiteralPath (Join-Path $dir.FullName 'candidate.pptx') -Destination $output -Force
  $p=$powerPoint.Presentations.Open($output,0,0,0)
  try {
   foreach($entry in $m.slides){
    $s=$p.Slides.Item([int]$entry.slide)
     $positions=@{}
    foreach($ev in $entry.events){
     $shape=$s.Shapes.Item([string]$ev.name)
     if($ev.type -eq 'rotate'){
      $fx=$s.TimeLine.MainSequence.AddEffect($shape,61,0,[int]$ev.trigger)
      $fx.Behaviors.Item(1).RotationEffect.By=[double]$ev.angle
      $fx.Timing.Duration=[double]$ev.duration
     } elseif($ev.type -eq 'move'){
      $shape.ZOrder(0)
      $fx=$s.TimeLine.MainSequence.AddEffect($shape,149,0,[int]$ev.trigger)
      $prior=$positions[[string]$ev.name]; if(-not $prior){$prior=@(0.0,0.0)}
      $sx=($prior[0]/1280).ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
      $sy=($prior[1]/720).ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
      $positions[[string]$ev.name]=@(($prior[0]+[double]$ev.dx),($prior[1]+[double]$ev.dy))
      $dx=(($prior[0]+[double]$ev.dx)/1280).ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
      $dy=(($prior[1]+[double]$ev.dy)/720).ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
      $fx.Behaviors.Item(1).MotionEffect.Path="M $sx $sy L $dx $dy E"
      $fx.Timing.Duration=[double]$ev.duration
     } else {
      $fx=$s.TimeLine.MainSequence.AddEffect($shape,1,0,[int]$ev.trigger)
      if($ev.type -eq 'exit'){$fx.Exit=-1}
     }
    }
   }
   $p.Save()
   $preview=Join-Path $dir.FullName 'preview'
   New-Item -ItemType Directory -Force -Path $preview | Out-Null
   $fit=@()
   # Static previews show the final teaching state, never stacked hidden layers.
   foreach($entry in $m.slides){
    $s=$p.Slides.Item([int]$entry.slide)
    foreach($ev in $entry.events){
     $shape=$s.Shapes.Item([string]$ev.name)
     if($ev.type -eq 'move'){$shape.Left += [double]$ev.dx*0.9375;$shape.Top += [double]$ev.dy*0.9375}
     elseif($ev.type -eq 'rotate'){$shape.Rotation += [double]$ev.angle}
     elseif($ev.type -eq 'exit'){$shape.Visible=0}
     else{$shape.Visible=-1}
    }
    foreach($shape in $s.Shapes){
     if($shape.Visible -eq 0 -or $shape.HasTextFrame -ne -1 -or $shape.TextFrame.HasText -ne -1){continue}
     $range=$shape.TextFrame2.TextRange
     if($range.BoundHeight -gt $shape.Height+2 -or $range.BoundWidth -gt $shape.Width+2){
      $fit+=@{slide=$entry.slide;shape=$shape.Name;height=[math]::Round($range.BoundHeight,2);available=[math]::Round($shape.Height,2);text=$shape.TextFrame.TextRange.Text}
     }
    }
    $s.Export((Join-Path $preview "slide-$($entry.slide).png"),'PNG',1600,900)
   }
   $p.Saved=-1
   ConvertTo-Json -InputObject @($fit) -Depth 5 | Set-Content -LiteralPath (Join-Path $dir.FullName 'text-fit.json')
   Write-Output "ANIMATED $($m.id) $($m.count) slides"
  } finally {$p.Close()}
 }
} finally {$powerPoint.Quit()}
