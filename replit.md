# replit.md

## Overview

This is a Discord music bot built with Node.js. The bot allows users to play music in voice channels, manage playlists, apply audio filters, and includes developer-only administrative commands. It uses Lavalink as the audio streaming backend through the Kazagumo/Shoukaku libraries.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v14** handles all Discord API interactions
- Uses Gateway Intents for Guilds, Messages, Voice States, and Message Content
- Commands are organized into a Collection for easy lookup

### Command System
- **Prefix-based commands** (default prefix: `!`)
- Commands are organized in category folders: `music/` and `devs/`
- Command loader dynamically reads all `.js` files from command folders
- Each command exports `name`, `aliases`, `category`, `description`, and `execute` function

### Music Architecture
- **Kazagumo** wrapper library manages music players
- **Shoukaku** provides the Lavalink connector for Discord.js
- **Lavalink** server handles actual audio streaming (configured in `config/lavalink.js`)
- Players are created per-guild and support queue management, filters, and autoplay
- Audio filters (bassboost, pop, soft, etc.) are defined in `config/filters.js`

### Handler Pattern
Three main handlers initialize the bot:
1. **commandLoader** - Loads all commands from folders into the client
2. **messageHandler** - Processes incoming messages, checks prefix/blacklist, routes to commands
3. **playerHandler** - Initializes Kazagumo music manager with Lavalink nodes

### Access Control
- **Developer commands** - Protected by `devCheck.js` which validates against owner IDs in config
- **Premium features** - Gated by `premiumCheck.js` (currently mocked)
- **Blacklist system** - Users/guilds can be blacklisted from using the bot

### Configuration
- Environment variables loaded via `dotenv` (TOKEN required)
- `config/config.js` - Bot token, owner IDs, default prefix
- `config/lavalink.js` - Lavalink node connection details
- `config/filters.js` - Audio equalizer presets

## External Dependencies

### Discord API
- **discord.js** - Primary library for Discord bot functionality
- Requires `TOKEN` environment variable for bot authentication

### Audio Streaming
- **Lavalink Server** - External Java-based audio server (must be running separately)
  - Default connection: `localhost:2333` with password `youshallnotpass`
- **Kazagumo/Shoukaku** - Node.js clients for Lavalink communication
- **kazagumo-spotify** - Spotify integration support (installed but not actively configured)

### Database
- **MongoDB via Mongoose** - Used for persistent storage
- Models defined for: User, Guild, Playlist, Track, Blacklist
- Currently some models are mocked with static returns
- Stores: user preferences, guild settings, blacklist status, playlists

### Environment Variables Required
- `TOKEN` - Discord bot token
- `DISCORD_TOKEN` - Alternative token variable in config (should consolidate)
- MongoDB connection string (not yet configured in code)