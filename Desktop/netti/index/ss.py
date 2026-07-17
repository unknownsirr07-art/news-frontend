from telethon.sync import TelegramClient
from telethon.sessions import StringSession

API_ID = 25833520
API_HASH = "7d012a6cbfabc2d0436d7a09d8362af7"

BOT_TOKENS = [
    "8615548004:AAE95R6K-J1l5VOtLMBMyLDbygfYrbJYi7I","8381900815:AAH8qJ25eb9vh4Vlhr5_ovgNzdqWsrg76AU"
]

for i, token in enumerate(BOT_TOKENS, start=1):
    print(f"\nGenerating session for Bot {i}...\n")

    with TelegramClient(StringSession(), API_ID, API_HASH) as client:
        client.start(bot_token=token)
        session_str = client.session.save()

        print(f"SESSION_{i} = {session_str}\n")