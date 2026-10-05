Add-Type -AssemblyName System.Drawing

$srcPath = "d:\victim-new\client\public\images\logo.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)
$w = $bmp.Width
$h = $bmp.Height
Write-Host "Original image: $w x $h"

$minX = $w
$minY = $h
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Bounding box: minX=$minX, minY=$minY, maxX=$maxX, maxY=$maxY"
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
Write-Host "Content size: $cropW x $cropH"

# We want the icon to completely fill the canvas with 0 transparent borders
$squareSize = [Math]::Max($cropW, $cropH)
$finalBmp = New-Object System.Drawing.Bitmap($squareSize, $squareSize)
$g = [System.Drawing.Graphics]::FromImage($finalBmp)
$g.Clear([System.Drawing.Color]::Transparent)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$destX = ($squareSize - $cropW) / 2
$destY = ($squareSize - $cropH) / 2

$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle([int]$destX, [int]$destY, $cropW, $cropH)
$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$finalBmp.Save("d:\victim-new\client\public\images\favicon_large.png", [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Save("d:\victim-new\client\public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$finalBmp.Save("d:\victim-new\client\public\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Png)

$bmp.Dispose()
$finalBmp.Dispose()
$g.Dispose()

Write-Host "SUCCESS: Cropped large favicon created!"
