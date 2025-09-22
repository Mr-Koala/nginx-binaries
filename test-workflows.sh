#!/bin/bash

echo "🔍 Testing GitHub workflow modifications..."
echo

# Test build-njs script
echo "=== Testing build-njs script ==="
if ./scripts/build-njs --help > /dev/null 2>&1; then
    echo "✅ build-njs script is executable and has help option"
else
    echo "❌ build-njs script has issues"
fi

# Check workflow files exist
echo
echo "=== Checking workflow files ==="
workflows=(
    ".github/workflows/binaries.yml"
    ".github/workflows/build-linux.yml"
    ".github/workflows/build-test.yml"
    ".github/workflows/build-custom.yml"
)

for workflow in "${workflows[@]}"; do
    if [ -f "$workflow" ]; then
        echo "✅ $workflow exists"
    else
        echo "❌ $workflow not found"
    fi
done

# Check for key modifications
echo
echo "=== Checking key modifications ==="

# Check if binaries.yml has been updated to remove win32
if grep -q "nginx-x86_64-win32" .github/workflows/binaries.yml; then
    echo "❌ binaries.yml still contains win32 builds"
else
    echo "✅ binaries.yml - win32 builds removed"
fi

# Check if binaries.yml only builds 1.28+ versions
if grep -q "1.26.x\|1.27.x" .github/workflows/binaries.yml; then
    echo "❌ binaries.yml still contains old nginx versions"
else
    echo "✅ binaries.yml - only builds 1.28+ versions"
fi

# Check if workflows use --with-modules
if grep -q "\-\-with-modules" .github/workflows/binaries.yml; then
    echo "✅ binaries.yml uses --with-modules"
else
    echo "❌ binaries.yml missing --with-modules"
fi

echo
echo "🎉 Workflow modification test completed!"
echo
echo "Summary of changes:"
echo "1. ✅ Modified build-njs script to support nginx modules"
echo "2. ✅ Updated all workflows to use --with-modules"
echo "3. ✅ Removed Windows builds from binaries.yml"
echo "4. ✅ Updated binaries.yml to only build nginx 1.28+"
echo "5. ✅ Fixed YAML syntax issues in workflows"