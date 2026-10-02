$updates = @{
    "index.html" = @{
        Title = "<title>IT Training Institute Hyderabad | Python, Java, AWS DevOps | Blujay Technologies</title>"
        Desc = '<meta name="description" content="Blujay Technologies is Hyderabad''s top IT training institute in Ameerpet. Learn Python, Java, AWS DevOps with 100% placement assistance. Free demo available.">'
        H1 = "Best IT Training Institute in Hyderabad | Python, Java, AWS DevOps Courses"
    }
    "blogs.html" = @{
        Title = "<title>IT Career Blog | Tips, Guides & Tech Trends | Blujay Technologies Hyderabad</title>"
        Desc = '<meta name="description" content="IT career tips, salary guides, course comparisons and tech tutorials from Blujay Technologies — Hyderabad''s leading IT training institute.">'
        H1 = "IT Career Blog — Tips, Guides & Course Updates | Blujay Technologies"
    }
    "all-courses.html" = @{
        Title = "<title>Best IT Courses in Hyderabad 2026 | DevOps, Python, Java | Blujay Technologies</title>"
        Desc = '<meta name="description" content="Explore all IT training courses in Hyderabad at Blujay Technologies — DevOps, Python, Java, Data Science, Digital Marketing and more. Enroll today.">'
        H1 = "IT Training Courses in Hyderabad | DevOps, Python, Java, Data Science"
    }
    "digital-marketing.html" = @{
        Title = "<title>Digital Marketing Course Hyderabad 2026 | SEO, PPC, AI Tools | Blujay Technologies</title>"
        Desc = '<meta name="description" content="Join Blujay''s AI-integrated Digital Marketing course in Hyderabad. Learn SEO, PPC, social media, and AI tools with live projects and placement support.">'
        H1 = "Digital Marketing Course in Hyderabad | AI-Integrated Full-Stack Program"
    }
    "about.html" = @{
        Title = "<title>Blujay Technologies | IT Training Since 2020 | Ameerpet, Hyderabad</title>"
        Desc = '<meta name="description" content="Learn about Blujay Technologies — founded in Ameerpet, Hyderabad in 2020. Expert trainers with 12–15 years of industry experience. Enroll today.">'
        H1 = "About Blujay Technologies | IT Training Institute in Ameerpet, Hyderabad"
    }
    "aws-devops.html" = @{
        Title = "<title>AWS DevOps Course in Hyderabad | Docker, K8s, Terraform | Blujay Technologies</title>"
        Desc = '<meta name="description" content="AWS DevOps course in Hyderabad at Blujay Technologies. Master Docker, Kubernetes, Terraform, CI/CD pipelines with hands-on labs. 100% placement support.">'
        H1 = "AWS DevOps Course in Hyderabad | Docker, Kubernetes, Terraform"
    }
    "python-full-stack.html" = @{
        Title = "<title>Python Full Stack Course Hyderabad | Django, React, REST API | Blujay Technologies</title>"
        Desc = '<meta name="description" content="Python Full Stack course in Hyderabad at Blujay Technologies. Learn Django, React, REST APIs with live projects. Placement assistance included.">'
        H1 = "Python Full Stack Course in Hyderabad | Django, React, Live Projects"
    }
    "java-full-stack.html" = @{
        Title = "<title>Java Full Stack Course Hyderabad | Spring Boot, Microservices | Blujay Technologies</title>"
        Desc = '<meta name="description" content="Java Full Stack course in Hyderabad. Master Spring Boot, Microservices, React with industry experts at Blujay Technologies, Ameerpet.">'
        H1 = "Java Full Stack Course in Hyderabad | Spring Boot, Microservices"
    }
    "azure-devops.html" = @{
        Title = "<title>Azure DevOps Course Hyderabad | CI/CD, Pipelines, AKS | Blujay Technologies</title>"
        Desc = '<meta name="description" content="Azure DevOps course in Hyderabad at Blujay Technologies. Learn CI/CD, Azure Pipelines, AKS, and DevOps practices with placement support.">'
        H1 = "Azure DevOps Course in Hyderabad | CI/CD Pipelines, AKS"
    }
}

foreach ($f in $updates.Keys) {
    if (Test-Path "d:\blujay-website\$f") {
        $c = Get-Content -Raw -Path "d:\blujay-website\$f"
        $c = [regex]::Replace($c, '(?is)<title>.*?</title>', $updates[$f].Title)
        $desc = $updates[$f].Desc
        if ($c -match '(?is)<meta\s+name="description"[\s\S]*?>') {
            $c = [regex]::Replace($c, '(?is)<meta\s+name="description"[\s\S]*?>', $desc)
        } else {
            $c = [regex]::Replace($c, '(?is)(<title>.*?</title>)', "`$1
    $desc")
        }
        $h1Text = $updates[$f].H1
        $c = [regex]::Replace($c, '(?is)(<h1[^>]*>).*?(</h1>)', "`$1$h1Text`$2")
        Set-Content -Path "d:\blujay-website\$f" -Value $c -Encoding UTF8
    }
}
