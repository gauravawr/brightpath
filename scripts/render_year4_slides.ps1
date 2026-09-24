param([string]$Root='.qa/year4-maths',[string[]]$Only=@())
$ErrorActionPreference='Stop'
$rootPath=(Resolve-Path -LiteralPath $Root).Path
$app=New-Object -ComObject PowerPoint.Application
try {
 foreach($dir in Get-ChildItem (Join-Path $rootPath 'build') -Directory){
  if($Only.Count -and $dir.Name -notin $Only){continue}
  $p=$app.Presentations.Open((Join-Path $dir.FullName 'static-preview.pptx'),0,0,0)
  try {
   $out=Join-Path $dir.FullName 'preview';New-Item -ItemType Directory -Force -Path $out | Out-Null
   $fit=@()
   foreach($s in $p.Slides){
    foreach($shape in $s.Shapes){
     if($shape.HasTextFrame -ne -1 -or $shape.TextFrame.HasText -ne -1){continue}
     $range=$shape.TextFrame2.TextRange
     if($range.BoundHeight -gt $shape.Height+2 -or $range.BoundWidth -gt $shape.Width+2){$fit+=@{slide=$s.SlideIndex;shape=$shape.Name;text=$shape.TextFrame.TextRange.Text;height=$range.BoundHeight;available=$shape.Height}}
    }
    $s.Export((Join-Path $out "slide-$($s.SlideIndex).png"),'PNG',1600,900)
   }
   ConvertTo-Json -InputObject @($fit) -Depth 5 | Set-Content (Join-Path $dir.FullName 'text-fit.json')
   Write-Output "RENDERED $($dir.Name) $($p.Slides.Count) slides"
  } finally {$p.Close()}
 }
} finally {$app.Quit()}
