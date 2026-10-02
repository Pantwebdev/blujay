$files = Get-ChildItem "d:\blujay-website\*.html" -Recurse | Where-Object { $_.Name -notmatch 'check-paths|test|ga4' }

foreach ($f in $files) {
    $c = Get-Content -Raw -Path $f.FullName
    $c = $c -replace 'href="#"(?=\s*onclick="document\.getElementById\(''contact-form''\))', 'href="#contact-form"'
    Set-Content -Path $f.FullName -Value $c -Encoding UTF8
}
