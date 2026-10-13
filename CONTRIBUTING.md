# Contributing

Thanks for helping improve ServerSage. Contributions should make server setup clearer and safer for people who are new to Discord bots.

## Before opening a pull request

1. Check existing issues so the same change is not already being discussed.
2. Explain the problem in plain language and describe the proposed change.
3. Keep the change focused. Do not add permissions or collect server data without a clear need.
4. Add or update automated tests for behavior changes.
5. Run npm run check and npm audit --audit-level=high.
6. Never include .env, bot tokens, personal server exports, or private message content.

## Local setup

Install Node.js 24.17 or newer, clone or download the repository, and run:

    npm ci
    npm run check

The tests use mock Discord channels. They do not require a real bot token or a live server.

## Pull requests

Use a short title that says what changed, such as “Skip channels that already exist”. Include the reason for the change, test results, and any permissions or user-facing behavior that changed.

By contributing, you agree that your contribution may be distributed under the MIT License in this repository.
