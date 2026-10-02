$ErrorActionPreference = "Stop"
$root = (Get-Location).Path

function Get-Canonical($fullPath) {
  $rel = $fullPath.Substring($root.Length).TrimStart('\\').Replace('\\','/')
  if ($rel -ieq 'index.html') { return 'https://www.blujaytech.com/' }
  return "https://www.blujaytech.com/$rel"
}

$htmlFiles = Get-ChildItem -Recurse -Filter *.html | Where-Object { -not $_.PSIsContainer }

foreach ($f in $htmlFiles) {
  $c = Get-Content -Raw -Path $f.FullName
  $c = [regex]::Replace($c, '(?is)<meta\s+charset\s*=\s*"[^"]+"\s*/?>\s*', '')
  $c = [regex]::Replace($c, '(?is)<head([^>]*)>', "<head$1`r`n    <meta charset=`"UTF-8`">", 1)
  $c = [regex]::Replace($c, '(?is)\s*<link\s+rel="canonical"[^>]*>\s*', "`r`n")
  $canonical = Get-Canonical $f.FullName
  $c = [regex]::Replace($c, '(<meta\s+charset="UTF-8"\s*/?>)', "$1`r`n    <link rel=`"canonical`" href=`"$canonical`">", 1)

  $c = $c -replace '(?i)hr@blujaytech\.com', 'info@blujaytech.com'
  $c = $c -replace '(?i)info@devopsexperts\.com', 'info@blujaytech.com'
  $c = $c -replace '(?<!\d)\+91[-\s]?96187[-\s]?21797(?!\d)', '+91 96187 21797'
  $c = $c -replace '(?<!\d)9618721797(?!\d)', '+91 96187 21797'

  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*Placement Assistance\s*)</a>', '<a$1href="/placement.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*Careers\s*)</a>', '<a$1href="/careers.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*Terms\s*&\s*Privacy\s*)</a>', '<a$1href="/terms.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*Success Stories\s*)</a>', '<a$1href="/success-stories.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*FAQs\s*)</a>', '<a$1href="/faqs.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*Community\s*)</a>', '<a$1href="/community/index.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?)>(\s*Blujay\s*Network!?\s*)</a>', '<a$1href="/community/index.html"$2>$3</a>', 'IgnoreCase')
  $c = [regex]::Replace($c, '<a([^>]*?)href="#"([^>]*?>\s*Book\s*Now\s*</a>)', '<a$1href="javascript:void(0);" onclick="document.getElementById(''contact-form'').scrollIntoView({behavior:''smooth''})"$2', 'IgnoreCase')
  $c = [regex]::Replace($c, 'href="#"', 'href="javascript:void(0);"', 'IgnoreCase')

  Set-Content -Path $f.FullName -Value $c -Encoding UTF8
}

Write-Output "stage1-ok"
