$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$iconSourceRoot=Split-Path -Parent $PSScriptRoot
$iconShapeDocument=Get-Content -LiteralPath (Join-Path $iconSourceRoot 'src/favicon-shapes.json') -Raw | ConvertFrom-Json
$iconOutput=Join-Path $iconSourceRoot 'src/icons'
[System.IO.Directory]::CreateDirectory($iconOutput) | Out-Null
$iconCulture=[System.Globalization.CultureInfo]::InvariantCulture
function Format-IconNumber([double]$Value){return $Value.ToString('0.###',$iconCulture)}

# SVG and all raster variants share exactly the same shapes.
$iconSvgShapes=foreach($shape in $iconShapeDocument.shapes){
 if($shape.type -eq 'path'){
  $iconPath=($shape.commands | ForEach-Object {($_ | ForEach-Object {if($_ -is [string]){$_}else{Format-IconNumber $_}}) -join ' '}) -join ' '
  '<path d="'+$iconPath+'" fill="'+$shape.fill+'" stroke="'+$shape.stroke+'" stroke-width="'+(Format-IconNumber $shape.width)+'"/>'
 }else{
  '<ellipse cx="'+(Format-IconNumber $shape.cx)+'" cy="'+(Format-IconNumber $shape.cy)+'" rx="'+(Format-IconNumber $shape.rx)+'" ry="'+(Format-IconNumber $shape.ry)+'" fill="'+$shape.fill+'"/>'
 }
}
$iconSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>Seven Little Sins crowned purple mascot</title><g stroke-linejoin="round" stroke-linecap="round">'+($iconSvgShapes -join '')+'</g></svg>'
[System.IO.File]::WriteAllText((Join-Path $iconOutput 'favicon.svg'),$iconSvg,[System.Text.UTF8Encoding]::new($false))

function Render-Icon([int]$Size){
 $scaleFactor=8
 $large=[System.Drawing.Bitmap]::new($Size*$scaleFactor,$Size*$scaleFactor,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $graphics=[System.Drawing.Graphics]::FromImage($large)
 $graphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
 $graphics.Clear([System.Drawing.Color]::Transparent)
 $graphics.ScaleTransform([single]($Size*$scaleFactor/32.0),[single]($Size*$scaleFactor/32.0))
 foreach($shape in $iconShapeDocument.shapes){
  $brush=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($shape.fill))
  if($shape.type -eq 'ellipse'){
   $graphics.FillEllipse($brush,[single]($shape.cx-$shape.rx),[single]($shape.cy-$shape.ry),[single](2*$shape.rx),[single](2*$shape.ry))
  }else{
   $path=[System.Drawing.Drawing2D.GraphicsPath]::new()
   [single]$px=0;[single]$py=0
   foreach($command in $shape.commands){
    switch($command[0]){
     'M' {$px=[single]$command[1];$py=[single]$command[2];$path.StartFigure()}
     'L' {$ex=[single]$command[1];$ey=[single]$command[2];$path.AddLine($px,$py,$ex,$ey);$px=$ex;$py=$ey}
     'Q' {$qx=[single]$command[1];$qy=[single]$command[2];$ex=[single]$command[3];$ey=[single]$command[4];$path.AddBezier($px,$py,[single]($px+2*($qx-$px)/3),[single]($py+2*($qy-$py)/3),[single]($ex+2*($qx-$ex)/3),[single]($ey+2*($qy-$ey)/3),$ex,$ey);$px=$ex;$py=$ey}
     'Z' {$path.CloseFigure()}
    }
   }
   $graphics.FillPath($brush,$path)
   $pen=[System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($shape.stroke),[single]$shape.width)
   $pen.LineJoin=[System.Drawing.Drawing2D.LineJoin]::Round
   $pen.StartCap=[System.Drawing.Drawing2D.LineCap]::Round;$pen.EndCap=$pen.StartCap
   $graphics.DrawPath($pen,$path);$pen.Dispose();$path.Dispose()
  }
  $brush.Dispose()
 }
 $graphics.Dispose()
 $small=[System.Drawing.Bitmap]::new($Size,$Size,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
 $resampler=[System.Drawing.Graphics]::FromImage($small)
 $resampler.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
 $resampler.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
 $resampler.DrawImage($large,0,0,$Size,$Size)
 $resampler.Dispose();$large.Dispose()
 return ,$small
}
$iconSizes=@(16,32,48,180)
foreach($iconSize in $iconSizes){
 $bitmap=Render-Icon $iconSize
 $file=if($iconSize -eq 180){'apple-touch-icon.png'}else{'favicon-'+$iconSize+'.png'}
 $bitmap.Save((Join-Path $iconOutput $file),[System.Drawing.Imaging.ImageFormat]::Png)
 $bitmap.Dispose()
}

# ICO: three embedded PNG images, for 16, 32 and 48 pixel browser surfaces.
$iconData=@(16,32,48 | ForEach-Object {,([System.IO.File]::ReadAllBytes((Join-Path $iconOutput ('favicon-'+$_+'.png'))))})
$iconStream=[System.IO.MemoryStream]::new()
$iconWriter=[System.IO.BinaryWriter]::new($iconStream)
$iconWriter.Write([uint16]0);$iconWriter.Write([uint16]1);$iconWriter.Write([uint16]3)
$offset=6+16*3
for($index=0;$index -lt 3;$index++){
 $size=@(16,32,48)[$index]
 $iconWriter.Write([byte]$size);$iconWriter.Write([byte]$size);$iconWriter.Write([byte]0);$iconWriter.Write([byte]0)
 $iconWriter.Write([uint16]1);$iconWriter.Write([uint16]32);$iconWriter.Write([uint32]$iconData[$index].Length);$iconWriter.Write([uint32]$offset)
 $offset+=$iconData[$index].Length
}
foreach($bytes in $iconData){$iconWriter.Write([byte[]]$bytes)}
$iconWriter.Flush();[System.IO.File]::WriteAllBytes((Join-Path $iconOutput 'favicon.ico'),$iconStream.ToArray());$iconWriter.Dispose();$iconStream.Dispose()

# Review actual 16/32/48 sizes, then a nearest-neighbor enlargement of 16px.
$sheet=[System.Drawing.Bitmap]::new(600,260)
$sheetGraphics=[System.Drawing.Graphics]::FromImage($sheet)
$sheetGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#F7F3E8'))
$font=[System.Drawing.Font]::new('Arial',12)
$labelBrush=[System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#30272B'))
$x=35
foreach($size in @(16,32,48)){
 $image=[System.Drawing.Image]::FromFile((Join-Path $iconOutput ('favicon-'+$size+'.png')))
 $sheetGraphics.DrawImageUnscaled($image,$x,65);$sheetGraphics.DrawString(($size.ToString()+' px'),$font,$labelBrush,[single]($x-3),[single]135)
 $image.Dispose();$x+=90
}
$enlarged=[System.Drawing.Image]::FromFile((Join-Path $iconOutput 'favicon-16.png'))
$sheetGraphics.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$sheetGraphics.PixelOffsetMode=[System.Drawing.Drawing2D.PixelOffsetMode]::Half
$sheetGraphics.DrawImage($enlarged,350,30,160,160)
$sheetGraphics.DrawString('16 px enlarged', $font,$labelBrush,[single]350,[single]210)
$enlarged.Dispose();$font.Dispose();$labelBrush.Dispose();$sheetGraphics.Dispose()
$sheet.Save((Join-Path $iconSourceRoot 'favicon-preview.png'),[System.Drawing.Imaging.ImageFormat]::Png);$sheet.Dispose()
Write-Output 'Generated SVG, ICO (16/32/48), PNG (16/32/48), Apple touch icon (180), and favicon-preview.png.'
