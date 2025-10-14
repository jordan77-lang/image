# 🎯 DSL Image Accessibility Tool

> **Professional AI-powered accessibility content generation for educational materials**

Generate DSL-compliant alt text, figure descriptions, long descriptions, and transcriptions using institutional accessibility standards and scientific writing best practices.

## 🌐 Live Application

**🚀 Primary Site (Full Features):** [https://image-accessibility-tool.netlify.app/](https://image-accessibility-tool.netlify.app/)  
**📱 GitHub Pages:** [https://jordan77-lang.github.io/image/](https://jordan77-lang.github.io/image/)

*Both sites offer full functionality with AI-powered content generation.*

## ✨ Key Features

### 🤖 **Advanced AI Generation**
- **Alt Text** (auto-validated under 120 characters)
- **Figure Descriptions** (Kroodsma-style scientific writing)
- **Long Descriptions** (comprehensive accessibility content)
- **Transcribed Text** (all visible text in logical order)

### 🎨 **Professional Interface**
- **Dark Mode** with system preference detection
- **Progress Indicators** for document processing
- **Copy Buttons** for instant clipboard access
- **Responsive Design** for all device sizes

### 🏛️ **Institutional Standards**
- **DSL Accessibility Compliance** built-in
- **WCAG Guidelines** automatically enforced
- **Scientific Writing Standards** (Douglas Kroodsma methodology)
- **Figure Numbering Prevention** (automatic removal)

### ⚡ **Smart Technology**
- **Auto-retry Logic** for length compliance
- **Context Document Upload** for enhanced accuracy
- **Health Monitoring** with system diagnostics
- **Error Recovery** with fallback strategies

## 🚀 Quick Start

1. **Visit** [image-accessibility-tool.netlify.app](https://image-accessibility-tool.netlify.app/)
2. **Upload** your image (drag & drop or browse)
3. **Add context** (optional but recommended)
4. **Generate** all accessibility content instantly
5. **Copy** results with one-click buttons

## 🎓 Educational Focus

Designed specifically for **DSL curriculum materials** with:
- **Scientific accuracy** in figure descriptions
- **Educational context** awareness
- **Interpretive writing** (not just visual description)
- **Compliance** with institutional accessibility standards

## 🏗️ Architecture

### **Hybrid Deployment**
- **Frontend**: GitHub Pages (static hosting)
- **Backend**: Netlify Functions (serverless AI processing)
- **API**: OpenAI GPT-4o Vision model
- **Standards**: Built-in DSL accessibility guidelines

### **Core Technologies**
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Netlify Functions
- **AI**: OpenAI GPT-4o with vision capabilities
- **Standards**: WCAG 2.1 AA compliance

### **Project Structure**
```
├── index.html                      # Main application interface
├── styles.css                      # Enhanced UI with dark mode & drag-drop
├── app.js                          # Frontend application logic
├── netlify/functions/
│   ├── generate-descriptions.js    # Main AI processing (OpenAI GPT-4o Vision)
│   ├── generate-descriptions-health.js  # Health monitoring endpoint
│   ├── permanent-references.js    # Institutional standards API
│   └── lib/
│       └── reference-storage.js   # Reference document storage
├── dreamscape-accessibility-standards.txt  # Core accessibility guidelines
├── figure-legends-guide.txt
└── package.json                    # Dependencies & configuration
```

## 🎯 Quality Assurance

### **Automatic Validation**
- ✅ **Alt text length** (auto-retry if > 120 characters)
- ✅ **Figure numbering removal** (comprehensive pattern matching)
- ✅ **Scientific accuracy** (domain-specific terminology)
- ✅ **Accessibility compliance** (WCAG standards)

### **Content Standards**
- **Alt Text**: Concise, under 120 characters
- **Figure Descriptions**: Kroodsma-style scientific interpretation
- **Long Descriptions**: Comprehensive accessibility content
- **Transcriptions**: Exact text preservation with logical order

## 🔧 For Developers

### **Local Development**
```bash
git clone https://github.com/jordan77-lang/image.git
cd image
# Open index.html in browser or serve with local server
python -m http.server 8080  # or your preferred method
```

### **API Configuration**
The frontend automatically connects to the Netlify backend. No additional setup required for standard usage.

### **Contributing**
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/jordan77-lang/image/issues)
- 💡 **Feature Requests**: Submit via issues with enhancement label
- 🔧 **Pull Requests**: Welcome! Please include tests and documentation

## 📊 Monitoring

- **Health Endpoint**: [/.netlify/functions/generate-descriptions-health](https://image-accessibility-tool.netlify.app/.netlify/functions/generate-descriptions-health)
- **System Status**: Real-time API availability monitoring
- **Performance Metrics**: Request processing and response times

## 📚 Resources

- 📖 **[W3C Image Tutorial](https://www.w3.org/WAI/tutorials/images/)** - Comprehensive accessibility guide
- 🎓 **[WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)** - Standards compliance
- 🔬 **[Scientific Writing Guide](https://www.nature.com/articles/d41586-019-02918-5)** - Figure description best practices

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments

Built for **Dreamscape Learn (DSL)** curriculum accessibility compliance.  
Implements **Douglas Kroodsma's** figure legend methodology for scientific education.

---

**🎯 Ready to make your educational content accessible?**  
**[Start using the tool →](https://image-accessibility-tool.netlify.app/)**
