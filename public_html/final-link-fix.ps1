$files = Get-ChildItem "d:\blujay-website\*.html" -Recurse | Where-Object { $_.Name -notmatch 'check-paths|test|ga4' }

foreach ($f in $files) {
    $c = Get-Content -Raw -Path $f.FullName
    
    # Ensure contact-form ID exists if there's a form
    if ($c -notmatch 'id="contact-form"') {
        if ($c -match '<form id="callbackForm"') {
            $c = $c -replace '<form id="callbackForm"', '<form id="contact-form"'
        } elseif ($c -match '<form') {
            $c = [regex]::Replace($c, '<form', '<form id="contact-form"', 1)
        }
    }

    # Standardize links
    # Book/Enroll/Apply Now
    $c = $c -replace 'href="#"([^>]*>(Book|Enroll|Apply|Register) Now)', 'href="#contact-form" onclick="document.getElementById(''contact-form'')?.scrollIntoView({behavior:''smooth''}); return false;"$1'
    # Logo id consistency
    if ($c -match 'src="logo\.png"' -and $c -notmatch 'id="site-logo"') {
        $c = [regex]::Replace($c, '(<img[^>]*src="logo\.png"[^>]*)>', '$1 id="site-logo">', 1)
    }

    Set-Content -Path $f.FullName -Value $c -Encoding UTF8
}
