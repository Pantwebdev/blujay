$c = Get-Content -Raw -Path "d:\blujay-website\index.html"
# Cleanup broken TODO inside DIV tags
$c = $c -replace '<div <!-- TODO: Verify each logo image file matches the correct company name -->\s*', '<!-- TODO: Verify each logo image file matches the correct company name -->
<div '
# Handle multiple occurrences of deduplicated TODOs if any
$c = [regex]::Replace($c, '(<!-- TODO: Verify each logo image file matches the correct company name -->\s*){2,}', "<!-- TODO: Verify each logo image file matches the correct company name -->
")

# LTI Mindtree Fix (where alt was Mu Sigma)
$c = $c.Replace('src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/LTIMindtree_logo.svg/1200px-LTIMindtree_logo.svg.png" alt="Mu Sigma"', 'src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/LTIMindtree_logo.svg/1200px-LTIMindtree_logo.svg.png" alt="LTI Mindtree"')

# Mu Sigma Fix (already correct in first set? Let's confirm if it needs fix anywhere)
# Actually, line 3734 looked correct.

Set-Content -Path "d:\blujay-website\index.html" -Value $c -Encoding UTF8
