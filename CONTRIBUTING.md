# Contributing to Amal

Thank you for your interest in contributing to Amal!

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- Expo CLI

### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Amal.git`
3. Install dependencies: `npm install`
4. Start development: `npm start`

## Development Guidelines

### Code Style

- Use JavaScript with modern ES6+ features
- Use functional components with React hooks
- Follow React Native best practices
- Use consistent naming conventions

### File Structure

```
Amal/
├── app/                  # Expo Router pages
├── components/           # Reusable UI components
├── services/             # API services and utilities
├── hooks/                # Custom React hooks
├── contexts/             # React Context providers
├── constants/            # App constants and colors
└── assets/               # Images, fonts, and other assets
```

### Component Guidelines

- Keep components focused and single-purpose
- Add loading states for async operations
- Use theme-aware styling via `useTheme()` hook
- Handle errors gracefully with user-friendly messages

## Testing

Before submitting changes:

1. Run the app on both iOS and Android (Expo Go)
2. Test the main flows: Quran reading, search, prayer times, Qibla
3. Verify Arabic text renders correctly
4. Check dark/light theme switching

```bash
# Run linting
npm run lint
```

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Test thoroughly
4. Submit a pull request with a description of changes

### PR Guidelines

- Keep changes focused and atomic
- Update documentation if needed
- Include screenshots for UI changes
- Reference any related issues

## Bug Reports

When reporting bugs, include:

- Device and OS information
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## Feature Requests

- Describe the feature clearly
- Explain the use case
- Consider implementation complexity

## Community

- Be respectful and inclusive
- Ask questions when unsure
- Help other contributors

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
