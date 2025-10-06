# Image Accessibility Tool

A specialized AI-powered tool for generating high-quality alt text and long descriptions for images used in DSL curriculum materials.

## 🌐 Live Site

Visit our GitHub Pages site: [https://jordan77-lang.github.io/image/](https://jordan77-lang.github.io/image/)

## 📋 About

This tool helps educators and content creators make their visual content accessible by:

- **Generating context-aware alt text** for images in DSL curriculum
- **Creating detailed long descriptions** for complex images like charts, diagrams, and infographics
- **Following WCAG accessibility guidelines** and best practices
- **Providing instant results** through API integration
- **Offering multiple access methods** (web interface and ChatGPT integration)

## 🚀 How to Use

### Option 1: Interactive Web Tool
1. Visit the [GitHub Pages site](https://jordan77-lang.github.io/image/)
2. Upload your image using the drag-and-drop interface
3. Provide context about how the image is used in your curriculum (optional)
4. Click "Generate Descriptions" to get instant results
5. Copy the generated alt text and long descriptions

### Option 2: ChatGPT Integration
1. Visit the [GitHub Pages site](https://jordan77-lang.github.io/image/)
2. Click on "Open Image Accessibility GPT" to access the ChatGPT version
3. Upload your image and provide context
4. Receive tailored alt text and long descriptions

**Note:** The ChatGPT option requires a ChatGPT account. Sign up for free at [chat.openai.com](https://chat.openai.com).

## ✨ Features

- 🎯 **Context-Aware**: Generates descriptions tailored to DSL curriculum context
- 📝 **Alt Text Generation**: Creates concise, meaningful alt text for screen readers
- 📖 **Long Descriptions**: Provides detailed descriptions for complex images
- ♿ **WCAG Compliant**: Follows accessibility standards and best practices
- ⚡ **Instant Results**: Get immediate feedback through API integration
- 🖥️ **User-Friendly Interface**: Drag-and-drop upload with real-time preview
- 📋 **Easy Copy/Export**: One-click copying and downloadable results
- 🔄 **Multiple Options**: Choose between instant API or ChatGPT integration

## 📚 Resources

The site includes:
- Step-by-step usage guide
- Interactive image upload tool
- Best practices for writing alt text and long descriptions
- Links to additional accessibility resources
- Information about when to use different types of descriptions

## 🛠️ Technical Details

### Frontend
- **HTML5** with semantic markup for accessibility
- **CSS3** with responsive design and modern styling
- **Vanilla JavaScript** for API integration and user interactions
- **GitHub Pages** for hosting

### API Integration
- RESTful API design with JSON responses
- Base64 image encoding for secure transmission
- CORS configuration for cross-origin requests
- Error handling and loading states
- Configurable endpoints and authentication

### Files Structure
```
├── index.html          # Main website
├── styles.css          # Styling and responsive design
├── api.js              # API integration classes
├── app.js              # Main application logic
├── example-api-server.js # Example API server
├── package.json        # Node.js dependencies
├── API_SETUP.md        # API configuration guide
└── README.md           # This file
```

## 🔧 API Setup

To set up your own accessibility bot API:

1. **Review the API setup guide**: See `API_SETUP.md` for detailed instructions
2. **Choose your AI provider**: OpenAI API, Custom GPT, or self-hosted solution
3. **Deploy your API**: Use Vercel, Netlify Functions, AWS Lambda, or your preferred platform
4. **Update configuration**: Modify the `API_CONFIG` object in `app.js`
5. **Test integration**: Ensure CORS is properly configured

### Example API Endpoints

```javascript
POST /api/generate-descriptions
{
  "image": "data:image/jpeg;base64,...",
  "context": "Chart showing student performance",
  "type": "both"
}
```

## 🚀 Quick Start for Developers

1. Clone the repository
2. Update API configuration in `app.js`
3. Set up your accessibility bot API (see `API_SETUP.md`)
4. Test locally or deploy to GitHub Pages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

Areas where contributions are especially welcome:
- API integrations with different AI providers
- UI/UX improvements
- Accessibility enhancements
- Documentation improvements
- Testing and bug fixes

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Links

- [GitHub Pages Site](https://jordan77-lang.github.io/image/)
- [Report an Issue](https://github.com/jordan77-lang/image/issues)
- [W3C Image Accessibility Tutorial](https://www.w3.org/WAI/tutorials/images/)

---

Made with ❤️ for accessible education
