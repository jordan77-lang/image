# GitHub Pages Deployment Guide

This document explains how to enable GitHub Pages for this repository so that the image accessibility tool site becomes publicly accessible.

## Steps to Enable GitHub Pages

1. **Navigate to Repository Settings**
   - Go to your repository: https://github.com/jordan77-lang/image
   - Click on **Settings** (in the repository menu)

2. **Access GitHub Pages Settings**
   - In the left sidebar, click on **Pages** (under "Code and automation")

3. **Configure the Source**
   - Under "Build and deployment"
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main` (or the branch where these files are merged)
   - **Folder**: Select `/ (root)`
   - Click **Save**

4. **Wait for Deployment**
   - GitHub will automatically build and deploy your site
   - This usually takes 1-3 minutes
   - You'll see a message with your site URL: `https://jordan77-lang.github.io/image/`

## After Deployment

Once GitHub Pages is enabled and deployed:

1. **Visit Your Site**
   - Your site will be available at: https://jordan77-lang.github.io/image/
   
2. **Update the GPT Link**
   - When you have your GPT URL from ChatGPT, edit `index.html`
   - Find the line: `<a href="#" class="btn btn-primary btn-large" id="gpt-link">Open Image Accessibility GPT</a>`
   - Replace `href="#"` with your actual GPT URL
   - Commit and push the change

3. **Share the Site**
   - Share the GitHub Pages URL with anyone who needs to use the tool
   - The site is publicly accessible and doesn't require a GitHub account to view

## Troubleshooting

### Site Not Loading After 5 Minutes
- Check that the branch is correct in Pages settings
- Ensure `index.html` is in the root of the selected branch
- Check the Actions tab for any build errors

### Custom Domain (Optional)
If you want to use a custom domain:
1. Add a `CNAME` file to the repository root with your domain
2. Configure DNS settings for your domain
3. Update the custom domain in GitHub Pages settings

### HTTPS Issues
- GitHub Pages automatically provides HTTPS
- If you see certificate warnings, wait a few minutes and refresh

## Files Structure

```
/
├── index.html          # Main landing page
├── styles.css          # Stylesheet
├── _config.yml         # Jekyll configuration
├── README.md           # Repository documentation
└── DEPLOYMENT.md       # This file
```

## Updating the Site

To make changes to the site:
1. Edit the HTML/CSS files locally or on GitHub
2. Commit and push your changes
3. GitHub Pages will automatically rebuild (takes 1-3 minutes)
4. Refresh your browser to see the updates

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Configuring a Publishing Source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-jekyll-build-errors-for-github-pages-sites)
