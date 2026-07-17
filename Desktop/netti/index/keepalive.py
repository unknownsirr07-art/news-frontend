from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = 25833520
API_HASH = "7d012a6cbfabc2d0436d7a09d8362af7"

SESSION = "1BVtsOLwBu0WgP1mQMt8GmSM8bwVsgSK49K_wwIZiSt5RKJwtHU5824oQt99flJfDZjVFWgnQxoyLyH8Mhe5XSvKUxz-oXy-J9g_A0YYSB2ronvHKYwIzAglQTBa_vFGT22MhNPUhoSYJOpOgkPgbmdeLjJ9OOQXIh_RcyKv14IkrQO09NTZSSpR6eKIZS2MezZJhRat_8CEFpv4uSQFg9gs4f-yJUHWujddF7FisaN7nmBoe35nenesxgLs2zlsBi2XeCUwJBh5iUhyPjZSn2vvrCfR3Q52XK-QsMNvsUwlX6ZFYUmH8XTdedtXFEKxilRYQzsC4St3BLEflH0RBOMW6iPEVIog="

async def check():
    client = TelegramClient(StringSession(SESSION), API_ID, API_HASH)
    await client.connect()

    if not await client.is_user_authorized():
        print("❌ Invalid session")
        return

    me = await client.get_me()

    print("✅ Session valid!")
    print(f"ID: {me.id}")
    print(f"Username: @{me.username}")
    print(f"Name: {me.first_name}")
    print(f"Bot: {me.bot}")

    await client.disconnect()

import asyncio
asyncio.run(check())