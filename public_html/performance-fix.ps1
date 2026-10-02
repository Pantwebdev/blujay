$files = Get-ChildItem "d:\blujay-website\*.html" -Recurse | Where-Object { $_.Name -notmatch 'check-paths|test|ga4' }

function Process-File($path) {
    $c = Get-Content -Raw -Path $path
    
    # 1. Image Optimizations (Lazy Load, FetchPriority, Dimensions)
    $imgMatches = [regex]::Matches($c, '<img[^>]*>')
    $firstImg = $true
    
    # We collect replacements to apply them safely
    $replacements = @()
    
    foreach ($m in $imgMatches) {
        $tag = $m.Value
        $newTag = $tag
        
        # Dimensions
        if ($newTag -notmatch 'width=') {
            if ($firstImg -or $newTag -match 'hero|founders|mission|banner') {
                $newTag = $newTag -replace '<img', '<img width="800" height="500"'
            } else {
                $newTag = $newTag -replace '<img', '<img width="400" height="300"'
            }
        }
        if ($newTag -notmatch 'height=') {
             # Already handled if width was missing, but if only height is missing:
             if ($newTag -match 'width="800"') { $newTag = $newTag -replace 'width="800"', 'width="800" height="500"' }
             elseif ($newTag -match 'width="400"') { $newTag = $newTag -replace 'width="400"', 'width="400" height="300"' }
        }

        # Lazy vs FetchPriority
        if ($firstImg) {
            if ($newTag -match 'loading="lazy"') { $newTag = $newTag -replace 'loading="lazy"', '' }
            if ($newTag -notmatch 'fetchpriority=') { $newTag = $newTag -replace '<img', '<img fetchpriority="high"' }
            $firstImg = $false
        } else {
            if ($newTag -match 'fetchpriority="high"') { $newTag = $newTag -replace 'fetchpriority="high"', '' }
            if ($newTag -notmatch 'loading="lazy"') { $newTag = $newTag -replace '<img', '<img loading="lazy"' }
        }
        
        # Cleanup extra spaces
        $newTag = $newTag -replace '\s+', ' ' -replace ' <img', '<img' -replace ' >', '>'
        
        if ($tag -ne $newTag) {
            $replacements += @{ Old = $tag; New = $newTag }
        }
    }
    
    # Apply Image Replacements (Unique tags only to avoid double replace)
    foreach ($r in $replacements) {
        $c = $c.Replace($r.Old, $r.New)
    }

    # 2. Unsplash comments
    # If we find /assets/images/unsplash- and no comment above it
    $c = $c -replace '(<?!--\s*TODO:.*unsplash.*-->\s*)?<img([^>]*src="/assets/images/unsplash-[^>]*>)', "<!-- TODO: Download this image, compress to WebP 80% quality, max 800px wide using squoosh.app, save to /assets/images/ -->
<img $2"
    # Deduplicate comments if script ran twice
    $c = [regex]::Replace($c, '(<!-- TODO:.*squoosh\.app.* -->\s*){2,}', "<!-- TODO: Download this image, compress to WebP 80% quality, max 800px wide using squoosh.app, save to /assets/images/ -->
")

    # 3. Logo Consolidation (Navbar)
    # Identify the logo in navbar and mobile menu.
    # We want one <img> with id="site-logo".
    # Desktop logo usually comes first.
    if ($c -match 'src="logo\.png"') {
        # Mark the first one as site-logo
        $c = [regex]::Replace($c, '(<img[^>]*src="logo\.png"[^>]*)(?<!id="site-logo")', '$1 id="site-logo"', 1)
        # Convert any other navbar logos to DIVs or remove them. 
        # The mobile menu logo often has a specific class or is in a specific div.
        # Let's find the one in mobile-menu.
        $c = [regex]::Replace($c, '(?is)(<div id="mobile-menu".*?)<img[^>]*src="logo\.png"[^>]*>', '$1<div class="h-9 w-28 bg-contain bg-no-repeat bg-left md:hidden" style="background-image:url(''logo.png'');" aria-label="Blujay Technologies"></div>', 1)
        # Also handle the existing div I might have created:
        $c = $c -replace '<div class="h-9 w-28 bg-contain bg-no-repeat bg-left" style="background-image:url\(''logo\.png''\);"', '<div class="h-9 w-28 bg-contain bg-no-repeat bg-left md:hidden" style="background-image:url(''logo.png'');"'
    }

    # 4. Dead Links
    # Book Now etc.
    $c = $c -replace 'href="#"([^>]*>(Book|Enroll|Apply|Register) Now)', 'href="#contact-form" onclick="document.getElementById(''contact-form'')?.scrollIntoView({behavior:''smooth''}); return false;"$1'
    $c = $c -replace 'href="javascript:void\(0\);"', 'href="#"' # Reset for easier matching
    $c = $c -replace 'href="#"([^>]*>Careers)', 'href="/careers.html"$1'
    $c = $c -replace 'href="#"([^>]*>Placement Assistance)', 'href="/placement.html"$1'
    $c = $c -replace 'href="#"([^>]*>(Terms & Privacy|Terms of Service))', 'href="/terms.html"$1'
    $c = $c -replace 'href="#"([^>]*>(Community|Blujay Network))', 'href="/community/index.html"$1'
    $c = $c -replace 'href="#"([^>]*>Success Stories)', 'href="/success-stories.html"$1'
    $c = $c -replace 'href="#"([^>]*>FAQs)', 'href="/faqs.html"$1'
    
    # Ensure id="contact-form" exists if we have links to it
    if ($c -match '#contact-form' -and $c -notmatch 'id="contact-form"') {
        # Add it to the first form or a section that looks like contact
        if ($c -match '<form') {
            $c = [regex]::Replace($c, '<form', '<form id="contact-form"', 1)
        } elseif ($c -match '<section[^>]*contact') {
             $c = [regex]::Replace($c, '(<section[^>]*contact[^>]*)>', '$1 id="contact-form">', 1)
        }
    }

    Set-Content -Path $path -Value $c -Encoding UTF8
}

foreach ($f in $files) {
    Write-Host "Optimizing $($f.Name)..."
    Process-File $f.FullName
}
