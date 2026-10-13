# Security policy

## Supported versions

Security fixes are made for the latest published release.

## Reporting a vulnerability

Please do not post tokens, private server details, or an unpatched vulnerability in a public issue. Use GitHub's private vulnerability reporting for this repository, or contact the maintainers through their GitHub profile if private reporting is unavailable.

Include the affected version, the steps needed to reproduce the issue, and its impact. Remove bot tokens, user IDs, and server IDs from logs before sharing them.

## Token and server safety

- Keep .env on your own computer or hosting service. It is ignored by Git.
- If a bot token is exposed, reset it in the Discord Developer Portal immediately.
- Install the bot with only View Channels and Manage Channels.
- ServerSage does not need message content, member lists, administrator access, or a database.
