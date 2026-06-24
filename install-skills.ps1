# ClearSite Solutions - Local Skill Copy Utility
# Copies selected agentic skill directories from local repository clone to this workspace .agents/skills folder

# 1. Configuration - Modify these paths if necessary
$SourceRepo = "E:\Repos\antigravity-awesome-skills"
$Destination = Join-Path $PSScriptRoot ".agents\skills"

# 2. Skill Selection - Add or remove folder names from this list
$SkillsToCopy = @(
    "brainstorming",
    "baseline-ui",
    "brand-guidelines",
    ## Essentials
    "concise-planning",
    "lint-and-validate",
    "kaizen",
    "systematic-debugging"
    # "git-pushing", 
    ## ---
    ## Web Wizard
    "frontend-design",
    "react-best-practices",
    "react-patterns",
    "nextjs-best-practices",
    "tailwind-patterns",
    "form-cro",
    "seo-audit",
    ## ---
    ## Web Designer
    "ui-ux-pro-max",
    "3d-web-experience",
    "canvas-design",
    "mobile-design",
    "scroll-experience",
    ### Startup founder
    ## "product-manager-toolkit",
    "competitive-landscape",
    "competitor-alternatives",
    "launch-strategy",
    "copywriting",
    "stripe-integration",
    ### ----------
    ### Marketing & Growth
    "content-creator",
    "programmatic-seo",
    "analytics-tracking",
    "ab-test-setup",
    "email-sequence",
    ### ---
    "copy-editing",
    # "tools-page-seo-optimizer",
    # "social-metadata-hardening",
    # "schema-markup-generator",
    "nextjs-seo-indexing"
)

# 3. Execution Logic
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "ClearSite Solutions Skill Installer" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Source Repository: $SourceRepo" -ForegroundColor White
Write-Host "Destination Directory: $Destination" -ForegroundColor White
Write-Host ""

# Verify source folder exists
$SourceSkillsPath = $SourceRepo 
if (-not (Test-Path -Path $SourceSkillsPath -PathType Container)) {
    Write-Error "Source skills directory not found at '$SourceSkillsPath'. Please verify your local clone path."
    exit 1
}

# Create destination folder if it doesn't exist
if (-not (Test-Path -Path $Destination -PathType Container)) {
    New-Item -ItemType Directory -Force -Path $Destination | Out-Null
    Write-Host "Created target customizations folder: $Destination" -ForegroundColor Yellow
}

$SuccessCount = 0
$FailureCount = 0

# Copy specified skills
foreach ($Skill in $SkillsToCopy) {
    $SkillSourcePath = Join-Path $SourceSkillsPath $Skill
    $SkillDestPath = Join-Path $Destination $Skill
    
    if (Test-Path -Path $SkillSourcePath -PathType Container) {
        Write-Host "Copying skill: $Skill..." -ForegroundColor Gray
        
        # Perform recursive copy
        Copy-Item -Path $SkillSourcePath -Destination $SkillDestPath -Recurse -Force
        
        Write-Host "  [SUCCESS] Copied to $SkillDestPath" -ForegroundColor Green
        $SuccessCount++
    } else {
        Write-Host "  [FAILED] Skill '$Skill' not found in source at $SkillSourcePath" -ForegroundColor Red
        $FailureCount++
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Copy Complete! Success: $SuccessCount, Failed: $FailureCount" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
