$ErrorActionPreference = "Stop"
$root = (Get-Location).Path

$whatsappBlock = @"
<a href="https://wa.me/919618721797?text=Hi%2C%20I%20want%20to%20know%20more%20about%20your%20IT%20courses"
   target="_blank"
   rel="noopener noreferrer"
   aria-label="Chat on WhatsApp"
   style="position:fixed;bottom:24px;right:24px;z-index:9999;background:#25D366;color:#fff;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);text-decoration:none;">
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.859L.057 23.428a.5.5 0 0 0 .609.61l5.7-1.49A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.944 0-3.77-.524-5.338-1.43l-.383-.224-3.981 1.04 1.067-3.894-.234-.393A9.955 9.955 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </svg>
</a>
"@

$indexSchema = @"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Blujay Technologies",
  "url": "https://www.blujaytech.com",
  "telephone": "+91-9618721797",
  "email": "info@blujaytech.com",
  "foundingDate": "2020",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Ameerpet",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "postalCode": "500038",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 17.4373949,
    "longitude": 78.4439476
  },
  "sameAs": [
    "https://linkedin.com/company/blujay-technologies",
    "https://instagram.com/blujaytech",
    "https://facebook.com/blujaytechnologies",
    "https://youtube.com/@blujaytech"
  ]
}
</script>
"@

$faqSchema = @"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the fee for this course at Blujay Technologies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Please contact us at +91 96187 21797 or attend a free demo class for current fee details."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide placement support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. We offer 100% placement assistance including resume preparation, mock interviews, and job referrals."
      }
    },
    {
      "@type": "Question",
      "name": "Is the course available online?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Both offline (Ameerpet, Hyderabad) and online live-interactive formats are available."
      }
    }
  ]
}
</script>
"@

# Unsplash mapping from image src attributes
$allHtml = Get-ChildItem -Recurse -Filter *.html
$unsplashMap = @{}
$i = 1
foreach ($f in $allHtml) {
  $raw = Get-Content -Raw -Path $f.FullName
  $ms = [regex]::Matches($raw, '<img[^>]*\s+src="(https://images\.unsplash\.com/[^\"]+)"[^>]*>', 'IgnoreCase')
  foreach ($m in $ms) {
    $u = $m.Groups[1].Value
    if (-not $unsplashMap.ContainsKey($u)) {
      $unsplashMap[$u] = "/assets/images/unsplash-{0:00}.webp" -f $i
      $i++
    }
  }
}

New-Item -ItemType Directory -Force -Path "assets/images" | Out-Null
foreach ($k in $unsplashMap.Keys) {
  $local = Join-Path $root ($unsplashMap[$k].TrimStart('/').Replace('/','\\'))
  if (-not (Test-Path $local)) {
    try { Invoke-WebRequest -Uri $k -OutFile $local -UseBasicParsing | Out-Null } catch {}
  }
}

foreach ($f in $allHtml) {
  $c = Get-Content -Raw -Path $f.FullName

  # targeted page metadata and H1
  switch ($f.Name.ToLowerInvariant()) {
    'index.html' {
      $c = [regex]::Replace($c, '(?is)<title>.*?</title>', '<title>IT Training Institute Hyderabad | Python, Java, AWS DevOps | Blujay Technologies</title>', 1)
      $c = [regex]::Replace($c, '(?is)<meta\s+name="description"\s+content="[^"]*"\s*/?>', '<meta name="description" content="Blujay Technologies is Hyderabad''s top IT training institute in Ameerpet. Learn Python, Java, AWS DevOps with 100% placement assistance. Free demo available.">', 1)
      $c = [regex]::Replace($c, '(?is)<h1[^>]*>.*?</h1>', '<h1 class="text-[28px] sm:text-[36px] lg:text-[58px] leading-[1.1] lg:leading-[1.12] font-extrabold text-gray-900 mb-4 lg:mb-6">Best IT Training Institute in Hyderabad | Python, Java, AWS DevOps Courses</h1>', 1)
      if ($c -notmatch '"url": "https://www.blujaytech.com"') { $c = [regex]::Replace($c, '(?is)</head>', "$indexSchema`r`n</head>", 1) }
      $c = $c -replace '<span class="counter" data-target="1000">0</span>\+', '<span class="counter" data-target="1000">1,000+</span>'
      $c = $c -replace '<span class="counter" data-target="4\.5" data-decimal="true">0</span>L', '<span class="counter" data-target="4.5" data-decimal="true">4.5L</span>'
      $c = $c -replace '<span class="counter" data-target="20">0</span>\+', '<span class="counter" data-target="20">20+</span>'
      $c = $c -replace '<span class="counter" data-target="25">0</span>\+', '<span class="counter" data-target="25">25+</span>'
      $c = [regex]::Replace($c, '<img[^>]*src="logo\.png"[^>]*class="h-9"[^>]*>', '<div class="h-9 w-28 bg-contain bg-no-repeat bg-left" style="background-image:url(''logo.png'');" aria-label="Blujay Technologies"></div>', 1)
      $c = [regex]::Replace($c, '(?is)(<!-- Duplicate Set -->.*?)(</div>\s*</div>\s*</section>)', {
          param($m)
          $seg = [regex]::Replace($m.Groups[1].Value, '<img\b(?![^>]*\baria-hidden=)', '<img aria-hidden="true"', 'IgnoreCase')
          return $seg + $m.Groups[2].Value
      }, 1)
    }
    'blogs.html' {
      $c = [regex]::Replace($c, '(?is)<title>.*?</title>', '<title>IT Career Blog | Tips, Guides & Tech Trends | Blujay Technologies Hyderabad</title>', 1)
      $c = [regex]::Replace($c, '(?is)<meta\s+name="description"\s+content="[^"]*"\s*/?>', '<meta name="description" content="IT career tips, salary guides, course comparisons, and tech tutorials from Blujay Technologies, Hyderabad''s leading IT training institute.">', 1)
      $c = [regex]::Replace($c, '(?is)<h1[^>]*>.*?</h1>', '<h1 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">IT Career Blog - Tips, Guides & Course Updates | Blujay Technologies</h1>', 1)
    }
    'all-courses.html' {
      $c = [regex]::Replace($c, '(?is)<title>.*?</title>', '<title>Best IT Courses in Hyderabad 2026 | DevOps, Python, Java | Blujay Technologies</title>', 1)
      $c = [regex]::Replace($c, '(?is)<h1[^>]*>.*?</h1>', '<h1>IT Training Courses in Hyderabad | DevOps, Python, Java, Data Science</h1>', 1)
    }
    'aboutus.html' {
      $c = [regex]::Replace($c, '(?is)<title>.*?</title>', '<title>Blujay Technologies | IT Training Since 2020 | Ameerpet, Hyderabad</title>', 1)
      $c = [regex]::Replace($c, '(?is)<meta\s+name="description"\s+content="[^"]*"\s*/?>', '<meta name="description" content="Learn about Blujay Technologies - founded in Ameerpet, Hyderabad in 2020. Expert trainers with 12-15 years of industry experience. Enroll today.">', 1)
      $c = [regex]::Replace($c, '(?is)<h1[^>]*>.*?</h1>', '<h1>About Blujay Technologies | IT Training Institute in Ameerpet, Hyderabad</h1>', 1)
    }
    'aws-devops-course-in-hyderabad.html' {
      $c = [regex]::Replace($c, '(?is)<title>.*?</title>', '<title>AWS DevOps Course in Hyderabad | Docker, K8s, Terraform | Blujay Technologies</title>', 1)
    }
    'digital-marketing-course-in-hyderabad.html' {
      $c = [regex]::Replace($c, '(?is)<title>.*?</title>', '<title>Digital Marketing Course Hyderabad 2026 | SEO, PPC, AI Tools | Blujay Technologies</title>', 1)
      $c = [regex]::Replace($c, '(?is)<h1[^>]*>.*?</h1>', '<h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-5 animate-fade-in-up leading-tight">Digital Marketing Course in Hyderabad | AI-Integrated Full-Stack Program</h1>', 1)
    }
  }

  if ($f.Name -like '*course-in-hyderabad.html' -and $c -notmatch '"@type": "FAQPage"') {
    $c = [regex]::Replace($c, '(?is)</head>', "$faqSchema`r`n</head>", 1)
  }

  # Student and service alt attributes
  $c = [regex]::Replace($c, '(?is)(<img[^>]*src="[^"]*student1\.webp"[^>]*?)alt="[^"]*"', '$1alt="IT student completing hands-on Python project at Blujay Technologies Hyderabad"')
  $c = [regex]::Replace($c, '(?is)(<img[^>]*src="[^"]*student2\.webp"[^>]*?)alt="[^"]*"', '$1alt="IT student practicing Java full stack exercises at Blujay Technologies Hyderabad"')
  $c = [regex]::Replace($c, '(?is)(<img[^>]*src="[^"]*student3\.webp"[^>]*?)alt="[^"]*"', '$1alt="IT student building AWS DevOps lab tasks at Blujay Technologies Hyderabad"')
  $c = [regex]::Replace($c, '(?is)(<img[^>]*src="[^"]*student4\.webp"[^>]*?)alt="[^"]*"', '$1alt="IT student completing live capstone training at Blujay Technologies Hyderabad"')
  $c = $c -replace 'alt="Digital Marketing"', 'alt="Digital marketing course training session in Hyderabad"'
  $c = $c -replace 'alt="Web Development"', 'alt="Web development course with live project training at Blujay Technologies"'

  # unsplash replacement + TODO comment
  foreach ($u in $unsplashMap.Keys) {
    $esc = [regex]::Escape($u)
    $c = [regex]::Replace($c, $esc, $unsplashMap[$u])
  }
  if ($c -match '/assets/images/unsplash-' -and $c -notmatch 'TODO: Compress each image to WebP at 80% quality') {
    $c = [regex]::Replace($c, '(<img[^>]*src="/assets/images/unsplash-[^>]*>)', "<!-- TODO: Compress each image to WebP at 80% quality, max 800px wide, using Squoosh.app -->`r`n$1", 1)
  }

  # counter default text where data-suffix exists
  $c = [regex]::Replace($c, '(<[^>]*data-target="([^"]+)"[^>]*data-suffix="([^"]+)"[^>]*>)\s*0(?:\+|%|L)?\s*(</[^>]+>)', {
      param($m)
      $target = $m.Groups[2].Value
      $suffix = $m.Groups[3].Value
      $formatted = $target
      if ($target -match '^\d+$') { $formatted = ([int64]$target).ToString('N0') }
      return "$($m.Groups[1].Value)$formatted$suffix$($m.Groups[4].Value)"
  })

  # image performance attrs
  $imgIndex = 0
  $c = [regex]::Replace($c, '<img\b[^>]*>', {
      param($m)
      $imgIndex++
      $tag = $m.Value
      if ($imgIndex -eq 1) {
        $tag = [regex]::Replace($tag, '\sloading="[^"]*"', '', 'IgnoreCase')
        if ($tag -notmatch '(?i)\sfetchpriority=') { $tag = $tag -replace '<img', '<img fetchpriority="high"' }
      } else {
        if ($tag -notmatch '(?i)\sloading=') { $tag = $tag -replace '<img', '<img loading="lazy"' }
      }
      if ($tag -notmatch '(?i)\swidth=') { $tag = $tag -replace '<img', '<img width="600"' }
      if ($tag -notmatch '(?i)\sheight=') { $tag = $tag -replace '<img', '<img height="400"' }
      return $tag
  })

  # whatsapp required block once
  $c = [regex]::Replace($c, '(?is)\s*<a[^>]*href="https://wa\.me/919618721797[^"]*"[^>]*>.*?</a>\s*', "`r`n")
  if ($c -notmatch 'aria-label="Chat on WhatsApp"') {
    $c = [regex]::Replace($c, '(?is)</body>', "$whatsappBlock`r`n</body>", 1)
  }

  Set-Content -Path $f.FullName -Value $c -Encoding UTF8
}

# Required root files
Set-Content -Path "sitemap.xml" -Encoding UTF8 -Value @"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.blujaytech.com/</loc><priority>1.0</priority></url>
  <url><loc>https://www.blujaytech.com/all-courses.html</loc><priority>0.9</priority></url>
  <url><loc>https://www.blujaytech.com/aws-devops.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.blujaytech.com/digital-marketing.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.blujaytech.com/python-full-stack.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.blujaytech.com/java-full-stack.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.blujaytech.com/azure-devops.html</loc><priority>0.8</priority></url>
  <url><loc>https://www.blujaytech.com/about.html</loc><priority>0.6</priority></url>
  <url><loc>https://www.blujaytech.com/blogs.html</loc><priority>0.6</priority></url>
</urlset>
"@

Set-Content -Path "robots.txt" -Encoding UTF8 -Value @"
User-agent: *
Allow: /
Sitemap: https://www.blujaytech.com/sitemap.xml
"@

$placeholderPages = @{
  'careers.html' = 'Careers at Blujay Technologies | Join Our Team in Hyderabad'
  'placement.html' = 'IT Placement Assistance Hyderabad | 100% Job Support | Blujay Technologies'
  'terms.html' = 'Terms & Privacy Policy | Blujay Technologies'
  'faqs.html' = 'FAQs | IT Courses in Hyderabad | Blujay Technologies'
  'success-stories.html' = 'Student Success Stories | IT Placements | Blujay Technologies'
}

foreach ($k in $placeholderPages.Keys) {
  $title = $placeholderPages[$k]
  $desc = "$title. Content and updates from Blujay Technologies Hyderabad."
  $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="canonical" href="https://www.blujaytech.com/$k">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <meta name="description" content="$desc">
</head>
<body>
    <main style="max-width: 760px; margin: 80px auto; padding: 0 20px; font-family: Arial, sans-serif; line-height: 1.6;">
        <h1>$title</h1>
        <p>Content coming soon. Contact us at info@blujaytech.com or call +91 96187 21797.</p>
    </main>
$whatsappBlock
</body>
</html>
"@
  Set-Content -Path $k -Value $html -Encoding UTF8
}

Write-Output "stage2-ok"
