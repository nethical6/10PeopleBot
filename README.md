<img src="assets/icon.jpg" alt="10People Bot Icon" width="120" />

# 10People Discord Bot

  [![GitHub contributors](https://img.shields.io/github/contributors/nethical6/10peoplebot)](https://github.com/nethical6/10peoplebot/graphs/contributors)
  [![Discord Server](https://img.shields.io/badge/Discord%20Server-white?style=flat&logo=discord)](https://discord.gg/yYqSHFcs2P)
  
A Discord bot that helps create meaningful connections in large Discord servers by automatically matching people based on their interests. Say goodbye to overwhelming message feeds and hello to deeper, more focused conversations with like-minded people. [Join the Discord server now to test it out!](https://discord.gg/yYqSHFcs2P)

## Features

- **Smart Interest Matching**
  - Automatically matches users based on shared interests and conversation patterns
  - Creates focused channels for matched groups
  - Facilitates meaningful discussions in smaller, more manageable groups

- **Automatic Channel Management**
  - Creates private channels for matched groups
  - Intelligently cleans up inactive channels
  - Maintains optimal group sizes for better conversations

- **Organic Community Building**
  - Natural group formation based on actual interactions
  - Vote-kick system for community moderation
  - Easy group leaving with self-kick command

- **Commands**
  - `/kickme` - Leave a channel
  - `/votekick` - Start a vote to kick a member

## How It Works

The bot uses natural language processing and interest analysis to match users:
1. Analyzes user messages and interactions
2. Uses Jaccard similarity to calculate interest overlap between users
3. Creates small, focused groups when sufficient interest matches are found
4. Manages channel lifecycle based on group activity

## Technical Stack

- TypeScript
- Discord.js
- Supabase (for database)
- Jaccard similarity for interest matching

## Project Structure

```
src/
├── commands/        # Bot command implementations
├── events/          # Discord event handlers
├── matching/        # Channel matching and cleanup logic
├── services/        # Core services (database, background tasks)
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Setup
1. Clone the repository
2. Install dependencies:
  ```bash
  npm install
  ```
3. Configure environment variables (create a `.env` file)
4. Set up the database schema on Supabase:
  - Open your Supabase project dashboard.
  - Go to the SQL editor and run the schema file located at `schema.sql` in the project root to create the required tables.
5. Deploy slash commands:
  ```bash
  npm run deploy
  ```
6. Start the bot:
  ```bash
  npm start
  ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
TOKEN=your_discord_bot_token
GUILD_ID=the_id_of_your_guild
CLIENT_ID=your_bots_client_id 
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## License

GPLV3