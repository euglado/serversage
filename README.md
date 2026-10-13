# ServerSage

[![CI](https://github.com/euglado/serversage/actions/workflows/ci.yml/badge.svg)](https://github.com/euglado/serversage/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

ServerSage helps a server administrator create a tidy starter layout without editing configuration files or learning bot commands. Choose a community, gaming, or study template, review the exact channel list, then confirm. The bot creates only missing categories and channels; it never deletes or edits anything already in the server.

The setup screens use Turkish when your Discord client is set to Turkish and English when it is set to English. Other client languages use the server language when it is Turkish, or English otherwise. The slash command is available as /server-setup, or /sunucu-kurulum in Turkish Discord clients.

[Türkçe kurulum rehberi](README.tr.md) · [Security policy](SECURITY.md) · [Contributing](CONTRIBUTING.md)

## What it does

- Opens a private, click-through setup wizard. Only the person who opened it can use its buttons.
- Shows a preview before making any changes. The Create layout button is a separate confirmation.
- Provides Community, Gaming, and Study templates. Each has three categories and seven channels.
- Reuses matching categories and skips matching channels that are already in those categories.
- Shows which items were created, which were already there, and which Discord could not create.
- Can be safely run again after a partial setup. Completed items are skipped on retry.
- Serializes setup requests for the same server inside one running bot process.
- Uses only Discord's Guilds Gateway intent. It does not read regular messages or need privileged intents.

## Layouts

| Template | Categories | Example channels |
| --- | --- | --- |
| Community | Start Here, Community, Voice | welcome, rules, announcements, general, introductions, questions, Lounge |
| Gaming | Start Here, Gaming, Voice | welcome, rules, announcements, general, looking-for-group, highlights, Party Room |
| Study | Start Here, Study Space, Voice | welcome, rules, announcements, study-room, questions, resources, Study Hall |

The wizard creates empty channels. It does not write server rules, publish a welcome message, create roles, change channel permissions, invite members, or modify Discord's onboarding settings. New channels use the server's normal default permissions. Review your server's role and channel permissions before inviting members.

## What you need

- Node.js 24.17 or newer. This version is required by the pinned discord.js 14.27.0 release; see the [discord.js documentation](https://discord.js.org/docs/packages/discord.js/14.27.0).
- A Discord account that can create an application in the [Discord Developer Portal](https://discord.com/developers/applications).
- A Discord server where you can install apps and manage channels.
- A computer or hosting service that can keep one Node.js process running.

If you close the bot's terminal or turn off the computer running it, ServerSage goes offline. The server layout it already created stays in Discord.

## Install the bot in Discord

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and choose **New Application**.
2. Give the application a name, such as ServerSage, and create it.
3. Open **Bot** in the left menu and create the bot user if the portal asks.
4. On the Bot page, choose **Reset Token** or **Copy Token**. Store it privately. Anyone with this token can control your bot.
5. Open **OAuth2 → URL Generator**. Select the **bot** and **applications.commands** scopes.
6. Under Bot Permissions, select only **View Channels** and **Manage Channels**. ServerSage does not need Administrator, Manage Roles, or access to message content.
7. Copy the generated URL, open it in your browser, choose your server, and authorize the installation.

Discord controls app installation and server permissions. See its [slash command guide](https://docs.discord.com/developers/docs/interactions/slash-commands) and [permissions reference](https://github.com/discord/discord-api-docs/blob/main/developers/topics/permissions.mdx).

## Run it on Windows without editing code

These steps use the included setup files. You do not need Git or an editor for source code.

1. On the GitHub page, select **Code → Download ZIP**, then extract the ZIP. Keep the extracted ServerSage folder somewhere you can find it.
2. Install Node.js 24.17 or newer from [nodejs.org](https://nodejs.org/en/download). If you already have an older version, install the newer one before continuing.
3. Open the ServerSage folder and double-click **setup-windows.cmd**. A black setup window installs the required packages and creates a private .env settings file.
4. In the same folder, open .env with Notepad. If Windows asks which app to use, choose Notepad. Fill in these values:

       DISCORD_TOKEN=paste-your-bot-token-here
       DISCORD_CLIENT_ID=your-application-id
       DISCORD_GUILD_ID=your-test-server-id

   Find the application ID in **Developer Portal → General Information → Application ID**. To copy your server ID, enable **Discord Settings → Advanced → Developer Mode**, then right-click your server icon and select **Copy Server ID**.

   Keep the value after each equals sign on the same line. Do not add quotation marks. Save the file as .env, not .env.txt. Never send your token to another person or include it in a screenshot.

5. Double-click **register-windows.cmd**. This adds the command to the test server named by DISCORD_GUILD_ID. Server-specific commands usually appear quickly.
6. Double-click **start-windows.cmd**. Keep the window open while the bot is in use.
7. In your server, run **/server-setup** or **/sunucu-kurulum**. Choose a template, review the preview, and press **Create layout** only when you are ready.
8. To stop the bot, focus its black window and press **Ctrl+C**.

To make the command available in every server where the app is installed, leave DISCORD_GUILD_ID empty and run register-windows.cmd again. Global commands can take longer to appear. The registration script updates only ServerSage's setup command; it does not replace the rest of your application's commands.

## Run from a terminal

Download or clone this repository, then open a terminal in its folder. Copy .env.example to .env and fill in the values described above.

    npm ci
    npm run commands:register
    npm start

You can run the automated tests without a Discord token:

    npm run check
    npm audit --audit-level=high

macOS and Linux users can copy the settings file with cp .env.example .env. Keep the process running in a terminal or configure your preferred Node.js host to restart it after a reboot. Run only one ServerSage process for each bot application.

## Use the setup wizard

1. You need **Manage Server** to open the wizard. This is a permission for the person using the command, not an extra permission for the bot.
2. Choose a layout from the dropdown. ServerSage shows every category and channel it plans to add.
3. Read the preview. Nothing has changed yet.
4. Press **Create layout** to confirm, or choose another template or cancel.
5. Read the result. The reply lists created items, items it left alone, and any items Discord rejected.

ServerSage needs **Manage Channels** to create the layout and **View Channels** to check existing channels. If a permission is missing, the wizard explains what an administrator needs to change. ServerSage never requests Administrator.

## Safe retry behavior

ServerSage matches categories by name and channel children by name, type, and parent category. It leaves matching items unchanged. It does not rename, move, reorder, delete, archive, or change permissions on existing channels.

If an existing category has custom permission overwrites, ServerSage skips that category and all of its planned channels. This avoids adding a channel that could fail to follow the category's privacy settings. The preview marks that section as skipped for safety.

Discord may hide channels from apps when channel permissions do not give the bot View Channels. Those hidden areas may be absent from the preview; a matching hidden category could therefore be created again. If your server has private categories, grant the bot View Channels in the areas where you want it to check the layout, or review the preview and avoid applying a template there.

Discord may reject one channel while allowing others to be created. ServerSage reports each failure and leaves completed work in place. Fix the permission or Discord-side issue, then run the same template again; already-created items will be skipped.

## Privacy

- The bot subscribes only to the Guilds Gateway intent. Message Content, Guild Members, and Presence intents are not enabled.
- ServerSage does not read or store messages, member lists, or transcripts.
- The bot does not use a database or send server data to a separate analytics service.
- The bot token stays in your local .env file or your hosting provider's private environment settings. .env is ignored by Git.
- Discord receives the standard channel creation requests needed to build the layout. Discord's own service stores the resulting server channels.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| “Node.js was not found” | Install Node.js 24.17 or newer, close the setup window, and open it again. |
| “DISCORD_TOKEN is missing” | Open .env, paste the bot token after DISCORD_TOKEN=, save, and start again. |
| “401: Unauthorized” or login fails | Reset the token on the Developer Portal's Bot page, replace the old value in .env, then restart. Never post the token in an issue. |
| The slash command does not appear | Run register-windows.cmd again. Check that the token and application ID belong to the same app, and that the bot was invited with applications.commands. |
| “Manage Server” message | The person using the command needs the Manage Server permission in that server. |
| “Manage Channels” message | An administrator must grant the bot Manage Channels. Also leave View Channels enabled so it can check the existing layout. |
| The bot goes offline | The computer or hosting process stopped. Start it again with start-windows.cmd. For a bot that must stay online, use a Node.js host that keeps the process running. |
| Some channels were created but others failed | Read the result list, fix the named permission or Discord-side issue, and rerun the same template. Existing items are skipped. |

If the problem continues, open a GitHub issue with the error code and steps to reproduce it. Remove tokens, server IDs, and private information from screenshots and logs.

## Development and tests

Install dependencies with npm ci and run npm run check. The test suite covers all templates, the preview/confirmation sequence, user and permission checks, idempotent retries, concurrent requests, and partial Discord API failures. Tests use mock channels and do not connect to a live Discord server.

GitHub Actions runs the same checks on pushes and pull requests. Dependency review uses npm audit with a high-severity threshold.

## License

ServerSage is available under the MIT License. See [LICENSE](LICENSE).
