#!/bin/bash

# Amal Quran Reader - GitHub Repository Setup Script
# This script helps you set up your GitHub repository

echo "🚀 Setting up GitHub repository for Amal Quran Reader"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please run 'git init' first."
    exit 1
fi

# Get current remote origin
REMOTE_URL=$(git remote get-url origin 2>/dev/null)

if [ -z "$REMOTE_URL" ]; then
    echo "📝 No remote origin found. Let's set it up!"
    echo ""
    echo "Please provide your GitHub repository URL:"
    echo "Format: https://github.com/YOUR_USERNAME/Amal.git"
    echo ""
    read -p "GitHub repository URL: " GITHUB_URL
    
    if [ -z "$GITHUB_URL" ]; then
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
    
    # Add remote origin
    git remote add origin "$GITHUB_URL"
    echo "✅ Remote origin added: $GITHUB_URL"
else
    echo "✅ Remote origin already set: $REMOTE_URL"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
echo ""

# Push and set upstream
git push -u origin "$CURRENT_BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! Your repository has been pushed to GitHub."
    echo ""
    echo "Next steps:"
    echo "1. Visit your GitHub repository"
    echo "2. Set up branch protection rules (recommended)"
    echo "3. Configure GitHub Actions secrets (if using Vercel deployment)"
    echo "4. Add collaborators (optional)"
    echo ""
    echo "GitHub Actions will automatically run on your next push!"
else
    echo ""
    echo "❌ Failed to push to GitHub. Please check:"
    echo "1. Your GitHub repository exists"
    echo "2. You have proper permissions"
    echo "3. Your GitHub credentials are configured"
    echo ""
    echo "You can manually push with: git push -u origin $CURRENT_BRANCH"
fi

echo ""
echo "📚 Repository setup complete!"
echo "Happy coding! 🎊"
