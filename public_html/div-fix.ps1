$c = Get-Content -Raw -Path "d:\blujay-website\index.html"
$c = $c -replace '<div <img', '<div class="company-logo-item">
<img'
Set-Content -Path "d:\blujay-website\index.html" -Value $c -Encoding UTF8
