# 🤝 Contributing to SnuggleSpace

Thank you for your interest in contributing to SnuggleSpace! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 How Can I Contribute?

### 🐛 Reporting Bugs

- Use the GitHub issue template for bugs
- Include detailed steps to reproduce
- Provide screenshots if applicable
- Mention your browser and OS version

### 💡 Suggesting Enhancements

- Use the GitHub issue template for feature requests
- Describe the feature and its benefits
- Consider the impact on existing functionality
- Provide mockups if possible

### 💻 Code Contributions

- Fork the repository
- Create a feature branch
- Make your changes
- Add tests for new functionality
- Ensure all tests pass
- Submit a pull request

## 🛠️ Development Setup

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- PostgreSQL (or Supabase)
- Git

### Local Development

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/snugglespace.git
   cd snugglespace
   ```

2. **Install dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   # Configure your database in .env
   php artisan migrate
   php artisan db:seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Laravel server
   php artisan serve
   
   # Terminal 2: Vite dev server
   npm run dev
   ```

### Using Docker (Laravel Sail)

```bash
# Start the application
./vendor/bin/sail up -d

# Install dependencies
./vendor/bin/sail composer install
./vendor/bin/sail npm install

# Run migrations
./vendor/bin/sail artisan migrate

# Build assets
./vendor/bin/sail npm run build
```

## 📝 Coding Standards

### PHP (Laravel)

- Follow [PSR-12](https://www.php-fig.org/psr/psr-12/) coding standards
- Use Laravel conventions for naming and structure
- Add type hints and return types where possible
- Write meaningful commit messages

### JavaScript/React

- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Maintain consistent formatting with Prettier

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Keep custom CSS minimal
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

### Database

- Use descriptive table and column names
- Add proper indexes for performance
- Include foreign key constraints
- Write clear migration descriptions

## 🧪 Testing

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Run JavaScript tests (if configured)
npm test
```

### Writing Tests

- Write tests for new features
- Ensure good test coverage
- Use descriptive test names
- Test both success and failure cases

### Test Structure

```php
// Example test structure
public function test_user_can_add_watch_list_item()
{
    // Arrange
    $user = User::factory()->create();
    $itemData = [
        'title' => 'Test Movie',
        'type' => 'movie',
        'status' => 'plan_to_watch'
    ];

    // Act
    $response = $this->actingAs($user)
        ->postJson('/v1/watch-list', $itemData);

    // Assert
    $response->assertStatus(201);
    $this->assertDatabaseHas('watch_lists', $itemData);
}
```

## 🔄 Pull Request Process

### Before Submitting

1. **Ensure your code works**
   - All tests pass
   - No linting errors
   - Code follows standards

2. **Update documentation**
   - Update README if needed
   - Add inline comments for complex logic
   - Update API documentation

3. **Test thoroughly**
   - Test on different browsers
   - Test responsive design
   - Test edge cases

### Pull Request Guidelines

1. **Create a descriptive title**
   - Use present tense ("Add feature" not "Added feature")
   - Be specific about the change

2. **Write a detailed description**
   - Explain what the PR does
   - Link to related issues
   - Include screenshots for UI changes

3. **Keep PRs focused**
   - One feature/fix per PR
   - Keep changes manageable
   - Break large changes into smaller PRs

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Screenshots included (if UI changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 100, Firefox 99]
- Version: [e.g. 1.0.0]

## Additional Information
Screenshots, logs, etc.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Screenshots, mockups, etc.
```

## 📚 Documentation

### Code Documentation

- Add PHPDoc comments for complex methods
- Document API endpoints
- Include examples in comments
- Keep documentation up to date

### User Documentation

- Update README for new features
- Add screenshots for UI changes
- Include setup instructions
- Document configuration options

## 🎨 UI/UX Guidelines

### Design Principles

- **Simplicity**: Keep interfaces clean and intuitive
- **Consistency**: Use consistent patterns and components
- **Accessibility**: Ensure the app is usable by everyone
- **Responsive**: Design for all screen sizes

### Color Scheme

- **Primary**: Pink (#ff6b9d)
- **Secondary**: Blue (#74b9ff)
- **Background**: Light gray (#f8f9fa)
- **Text**: Dark gray (#2d3436)

### Typography

- **Headings**: Inter or system font
- **Body**: Inter or system font
- **Sizes**: Follow Tailwind's scale
- **Weights**: Regular (400), Medium (500), Bold (700)

## 🔒 Security

### Security Guidelines

- Never commit sensitive data
- Validate all user inputs
- Use prepared statements
- Implement proper authentication
- Follow OWASP guidelines

### Reporting Security Issues

- Forward security issues to [Email loading...]
- Don't create public issues for security problems
- Provide detailed information about the vulnerability

## 📞 Getting Help

### Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GitHub Issues](https://github.com/yourusername/snugglespace/issues)

### Community

- Join our Discord server
- Follow us on Twitter
- Check our blog for updates

## 🙏 Recognition

Contributors will be recognized in:

- GitHub contributors list
- Project README
- Release notes
- Community shoutouts

---

**Thank you for contributing to SnuggleSpace!** 🎬💕

Your contributions help make this app better for couples everywhere. 