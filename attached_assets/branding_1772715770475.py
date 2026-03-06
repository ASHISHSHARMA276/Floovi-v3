import aiohttp
import base64
from discord.ext import commands
from discord import app_commands

from utils.success_send import send_success_message
from utils.send_errors import send_error_embed
from utils.bl_ignore import bl_ignore_check
from utils.server_owner import is_server_owner
from utils.subcmds import send_subcommand_help

class Branding(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.session = aiohttp.ClientSession()

    async def cog_unload(self):
        await self.session.close()

    async def format_image(self, url: str):
        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    return None, "Failed to download image. Invalid URL or server error."
                
                content_type = response.headers.get('Content-Type', '')
                if not content_type.startswith('image/'):
                    return None, "The link provided does not point to a valid image."

                image_bytes = await response.read()
                encoded = base64.b64encode(image_bytes).decode('utf-8')
                return f"data:{content_type};base64,{encoded}", None
            
        except Exception as e:
            return None, f"An error occurred while downloading the image: {e}"

    async def process_branding(self, ctx: commands.Context, payload: dict):
        guild_id = ctx.guild.id
        
        url = f"https://discord.com/api/v10/guilds/{guild_id}/members/@me"

        headers = {
            "Authorization": f"Bot {self.bot.http.token}",
            "Content-Type": "application/json"
        }

        try:
            async with self.session.patch(url, json=payload, headers=headers) as response:
                if response.status in [200, 204]:
                    return True, None
                else:
                    error_text = await response.text()
                    error_message = f"Discord API returned status {response.status}: {error_text}"
                    return False, error_message

        except Exception as e:
            return False, f"An unexpected error occurred: {e}"

    @commands.hybrid_group(name="customize", aliases=["branding"], description="Manage the bot's server profile.")
    @commands.guild_only()
    @is_server_owner()
    @bl_ignore_check()
    @commands.cooldown(1, 6, commands.BucketType.guild)
    async def customize(self, ctx: commands.Context):
        if ctx.invoked_subcommand is None:
            await send_subcommand_help(ctx)

    @customize.command(name="avatar", description="Change the bot's server-specific avatar using a link.")
    @app_commands.describe(url="The direct link to the image.")
    @commands.guild_only()
    @is_server_owner()
    @bl_ignore_check()
    @commands.cooldown(1, 16, commands.BucketType.guild)
    async def avatar(self, ctx: commands.Context, url: str):
        encoded_image, error = await self.format_image(url)
        if error:
            return await send_error_embed(ctx, error)
        
        success, error_msg = await self.process_branding(ctx, {'avatar': encoded_image})
        if success:
            await send_success_message(ctx, "Avatar Updated", "The bot's server avatar has been successfully changed.")
        else:
            await send_error_embed(ctx, error_msg)

    @customize.command(name="banner", description="Change the bot's server-specific banner using a link.")
    @app_commands.describe(url="The direct link to the image.")
    @commands.guild_only()
    @is_server_owner()
    @bl_ignore_check()
    @commands.cooldown(1, 16, commands.BucketType.guild)
    async def banner(self, ctx: commands.Context, url: str):
        encoded_image, error = await self.format_image(url)
        if error:
            return await send_error_embed(ctx, error)
            
        success, error_msg = await self.process_branding(ctx, {'banner': encoded_image})
        if success:
            await send_success_message(ctx, "Banner Updated", "The bot's server banner has been successfully changed.")
        else:
            await send_error_embed(ctx, error_msg)

    @customize.command(name="bio", description="Change the bot's server-specific bio (About Me).")
    @app_commands.describe(text="The new bio text (max 190 characters).")
    @commands.guild_only()
    @is_server_owner()
    @bl_ignore_check()
    @commands.cooldown(1, 12, commands.BucketType.guild)
    async def bio(self, ctx: commands.Context, *, text: str):
        if len(text) > 190:
            return await send_error_embed(ctx, "Bio cannot exceed 190 characters.")

        success, error_msg = await self.process_branding(ctx, {'bio': text})
        if success:
            await send_success_message(ctx, "Bio Updated", "The bot's server bio has been successfully updated.")
        else:
            await send_error_embed(ctx, error_msg)

    @customize.command(name="reset", description="Reset specific branding elements to default.")
    @app_commands.describe(option="The element you want to reset.")
    @app_commands.choices(option=[
        app_commands.Choice(name="Avatar", value="Avatar"),
        app_commands.Choice(name="Banner", value="Banner"),
        app_commands.Choice(name="Bio", value="Bio"),
        app_commands.Choice(name="All", value="All")
    ])
    @commands.guild_only()
    @is_server_owner()
    @bl_ignore_check()
    @commands.cooldown(1, 6, commands.BucketType.guild)
    async def reset(self, ctx: commands.Context, option: app_commands.Choice[str]):
        selected_option = option.value
        payload = {}
        description = ""

        if selected_option == "Avatar":
            payload['avatar'] = None
            description = "Server avatar has been reset to default."
        elif selected_option == "Banner":
            payload['banner'] = None
            description = "Server banner has been reset to default."
        elif selected_option == "Bio":
            payload['bio'] = None
            description = "Server bio has been reset to empty."
        elif selected_option == "All":
            payload = {'nick': None, 'avatar': None, 'banner': None, 'bio': None}
            description = "All server profile settings have been reset to default."

        success, error_msg = await self.process_branding(ctx, payload)
        if success:
            await send_success_message(ctx, "Branding Reset", description)
        else:
            await send_error_embed(ctx, error_msg)

async def setup(bot: commands.Bot):
    await bot.add_cog(Branding(bot))