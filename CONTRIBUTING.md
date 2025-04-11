# Contributing to nodejs-ts-auto-rest

Thank you for your interest in contributing to nodejs-ts-auto-rest! This document provides guidelines and instructions to help you get started.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. Clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment details (OS, Node.js version, etc.)

### Suggesting Enhancements

We welcome suggestions for improving nodejs-ts-auto-rest. To suggest an enhancement:

1. Create an issue with a clear title and detailed description
2. Explain why this enhancement would be useful
3. Suggest an implementation approach if possible

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`
3. Make your changes
4. Ensure your code follows the project's style guide
5. Write or update tests as needed
6. Update documentation if necessary
7. Submit a pull request

## Development Setup

1. Clone your fork of the repository
2. Install dependencies: `npm install`
3. Make sure MongoDB is running locally or configure connection
4. Run in development mode: `npm run dev`

## Coding Guidelines

### TypeScript Style Guide

- Follow the ESLint configuration included in the project
- Use meaningful variable and function names
- Add JSDoc comments for functions and methods
- Keep code modular and maintainable

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests after the first line

Example:
```
Add custom authentication middleware

- Implement JWT verification
- Add user context to request
- Create middleware factory

Fixes #123
```

### Testing

- Write tests for new features or bug fixes
- Ensure all tests pass before submitting a pull request
- Aim for high test coverage

## Project Structure

When adding new features, please follow the existing project structure:

- Put models in the `src/models` directory
- Put modules in the `src/modules` directory
- Put shared types in the `src/factory/types` directory
- Put decorators in the `src/factory/decorators` directory

## Documentation

- Update the README.md if your changes affect how users interact with the project
- Document complex code with inline comments
- Update or add JSDoc comments for public APIs

## Release Process

The project maintainers will handle the release process, including:

1. Updating the version number
2. Creating release notes
3. Publishing to npm (if applicable)

## Questions?

If you have any questions about contributing, please create an issue with your question.

Thank you for contributing to nodejs-ts-auto-rest!
