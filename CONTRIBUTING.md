# Contributing to Amal Quran Reader

Thank you for your interest in contributing to Amal! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git
- Expo CLI

### Setup Development Environment
1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Amal.git`
3. Install dependencies: `npm install`
4. Start development server: `npm start`

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow React Native best practices
- Use functional components with hooks
- Maintain consistent naming conventions
- Add proper TypeScript types for all functions and variables

### File Structure
```
Amal/
├── app/                    # Expo Router app directory
├── components/            # Reusable UI components
├── services/             # API services and utilities
├── hooks/                # Custom React hooks
├── constants/            # App constants and colors
└── assets/               # Images, fonts, and other assets
```

### Component Guidelines
- Keep components focused and single-purpose
- Use proper prop types and interfaces
- Implement proper error boundaries
- Add loading states for async operations
- Use theme-aware styling

## 🔧 API Integration

### Adding New API Endpoints
1. Extend the `QuranApiService` class in `services/quranApi.ts`
2. Add proper TypeScript interfaces
3. Implement error handling
4. Add unit tests for new functionality

### Voice Recognition Features
- Follow the existing command parsing pattern
- Add new voice commands to `parseVoiceCommand()`
- Implement corresponding UI handlers
- Test with various voice inputs

## 🧪 Testing

### Running Tests
```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests (when implemented)
npm test
```

### Testing Guidelines
- Test all new features
- Ensure proper error handling
- Test on multiple devices/simulators
- Verify Arabic text rendering
- Test theme switching functionality

## 📱 Platform Considerations

### iOS
- Test on iOS Simulator
- Verify Arabic font rendering
- Check accessibility features
- Test voice recognition (when implemented)

### Android
- Test on Android Emulator
- Verify Arabic text direction
- Check performance on lower-end devices
- Test various screen sizes

### Web
- Test responsive design
- Verify Arabic text rendering in browsers
- Check accessibility compliance
- Test keyboard navigation

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Theme switching works
- [ ] Arabic text renders correctly
- [ ] Voice features work (if implemented)

### Deployment Process
1. Create a feature branch
2. Make your changes
3. Run tests locally
4. Create a pull request
5. Wait for CI/CD pipeline to complete
6. Merge after review approval

## 🐛 Bug Reports

### Reporting Bugs
When reporting bugs, please include:
- Device/OS information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots or screen recordings
- Console logs (if applicable)

### Bug Fix Guidelines
- Reproduce the bug locally
- Write a test case if possible
- Fix the root cause, not symptoms
- Add proper error handling
- Test the fix thoroughly

## ✨ Feature Requests

### Suggesting Features
- Describe the feature clearly
- Explain the use case
- Provide mockups if possible
- Consider implementation complexity
- Think about accessibility

### Implementing Features
- Discuss with maintainers first
- Create a detailed plan
- Break down into smaller tasks
- Follow existing patterns
- Add proper documentation

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions
- Document complex logic
- Update README.md for new features
- Add inline comments for Arabic text handling
- Document API integration patterns

### User Documentation
- Update README.md
- Add usage examples
- Document voice commands
- Provide troubleshooting guides
- Add screenshots for new features

## 🤝 Community Guidelines

### Communication
- Be respectful and inclusive
- Use clear, constructive language
- Ask questions when unsure
- Help other contributors
- Follow the project's code of conduct

### Review Process
- Review your own code first
- Respond to review comments promptly
- Be open to suggestions
- Learn from feedback
- Help review others' code

## 📄 License

By contributing to Amal, you agree that your contributions will be licensed under the MIT License.

## 🙏 Acknowledgments

Thank you for contributing to making Amal a better Quran reading experience for Muslims worldwide!

---

**Need Help?** Open an issue or join our community discussions!
