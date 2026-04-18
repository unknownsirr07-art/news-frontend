# bot.py

import os
import logging
import asyncio
from pyrogram import Client, filters
from pyrogram.types import Message
from pyrogram.errors import FloodWait
from pymongo import MongoClient
from dotenv import load_dotenv
from config import API_ID, API_HASH, BOT_TOKEN, BIN_CHANNEL, MONGO_URI
from crypto import encrypt_msg_id
import manual
import re
import threading
from keepalive import run


# Load .env if needed
load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("indexer.log")]
)
logger = logging.getLogger(__name__)

# Pyrogram client
app = Client("indexer", api_id=API_ID, api_hash=API_HASH, bot_token=BOT_TOKEN)

# MongoDB setup
mongo = MongoClient(MONGO_URI)
db = mongo["media_index"]
collection = db["files"]
manual.register_manual_upload(app, collection)
# Queue for media messages
media_queue = asyncio.Queue()
threading.Thread(target=run).start()
async def index_worker():
    while True:
        message = await media_queue.get()
        try:
            await index_media(message)
        except Exception as e:
            logger.error(f"Error while indexing: {e}", exc_info=True)
        media_queue.task_done()

def extract_season_episode(text: str) -> str:
    text = text.lower()
    patterns = [
        r'\bs(?P<season>\d{1,2})\s*e(?P<episode>\d{1,2})\b',
        r'\bs(?P<season>\d{1,2})\b',
        r'\be(?P<episode>\d{1,2})\b',
        r'\bpart\s*(?P<part>\d{1,2})\b',
        r'\[e(?P<start>\d{1,2})-e(?P<end>\d{1,2})\]',
        r'\bep\.?\s*(?P<ep>\d{1,2})\b',
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            groups = match.groupdict()
            if 'season' in groups and 'episode' in groups and groups['season'] and groups['episode']:
                return f"s{int(groups['season']):02}e{int(groups['episode']):02}"
            if 'season' in groups and groups['season']:
                return f"s{int(groups['season']):02}"
            if 'episode' in groups and groups['episode']:
                return f"e{int(groups['episode']):02}"
            if 'part' in groups and groups['part']:
                return f"part{int(groups['part'])}"
            if 'start' in groups and 'end' in groups:
                return f"e{int(groups['start']):02}-e{int(groups['end']):02}"
            if 'ep' in groups and groups['ep']:
                return f"e{int(groups['ep']):02}"

    return 'full'

def extract_dedup_key(caption: str) -> str:
    caption_lower = caption.lower().replace('.', ' ')

    # Normalize language shorthands
    lang_shorthands = {
        'hin': 'hindi', 'hi': 'hindi', 'eng': 'english', 'en': 'english',
        'tam': 'tamil', 'tel': 'telugu', 'ben': 'bengali'
    }
    for short, full in lang_shorthands.items():
        caption_lower = re.sub(rf'\b{short}\b', full, caption_lower)

    # Handle cases like "1917 - 2019" at start: first year is title, second is release year
    title_year = None
    explicit_year = None
    start_year_pattern = r'^(?P<title_year>(?:19|20)\d{2})\s*[-–]\s*(?P<release_year>(?:19|20)\d{2})\b'
    m_start = re.search(start_year_pattern, caption_lower)
    if m_start:
        title_year = m_start.group('title_year')
        explicit_year = m_start.group('release_year')
        # remove that prefix from caption to avoid double-counting
        caption_lower = re.sub(start_year_pattern, '', caption_lower, count=1)

    # Regex patterns for metadata
    year_pattern    = r'\b(19|20)\d{2}\b'
    quality_pattern = r'\b(240p|360p|480p|540p|720p|1080p|2160p|4k)\b'
    codec_pattern   = r'\b(camrip|webdl|bluray|hdrip|webrip|dvd|brrip|hddvd|hdtv|hdtc|hdts|x265|x264|hevc)\b'

    season_episode = extract_season_episode(caption_lower)

    # Remove season/episode info from title
    title_wo_se = re.sub(
        r'(s\d{1,2}\s*e\d{1,2}|s\d{1,2}|e\d{1,2}|part\s*\d{1,2}|\[e\d{1,2}-e\d{1,2}\]|ep\.?\s*\d{1,2}|episode\s*\d{1,2})',
        '',
        caption_lower
    )

    # Determine cutoff by first metadata match
    match_positions = []
    for pattern in [year_pattern, quality_pattern, codec_pattern]:
        match = re.search(pattern, title_wo_se)
        if match:
            match_positions.append(match.start())
    cutoff = min(match_positions) if match_positions else len(title_wo_se)
    raw_title = title_wo_se[:cutoff]

    # Clean and normalize title
    clean_title = re.sub(r'[\[\]\(\)\|:;~_\-]', ' ', raw_title)
    clean_title = re.sub(r'\s+', ' ', clean_title).strip()

    # Use title_year if extracted at start, else fallback to default year for title
    if title_year:
        # If the extracted title part is numeric, use as title; else prefix cleaned string
        clean_title = title_year if clean_title == '' else clean_title

    # Year resolution: prefer explicit_year, otherwise first match in caption
    if explicit_year:
        year = explicit_year
    else:
        y_m = re.search(year_pattern, caption_lower)
        year = y_m.group(0) if y_m else 'unknown'

    # Quality and codec
    q_m = re.search(quality_pattern, caption_lower)
    quality = q_m.group(1) if q_m else 'unknown'
    c_m = re.search(codec_pattern, caption_lower)
    codec = c_m.group(1) if c_m else 'unknown'

    # Language detection
    languages = [
        'hindi','english','bengali','telugu','tamil','malayalam','kannada','gujarati','marathi','punjabi','urdu','bhojpuri',
        'russian','thai','japanese','rajasthani','haryanvi','odia','spanish','french','indonesian',
        'german','italian','portuguese','arabic','chinese','korean','vietnamese','dutch','swedish','norwegian','danish',
        'finnish','polish','ukrainian','greek','hebrew','turkish','persian','czech','romanian','hungarian','serbian'
    ]
    lang_pattern = r'\b(' + '|'.join(languages) + r')\b'
    langs_found = re.findall(lang_pattern, caption_lower, flags=re.IGNORECASE)
    lang = "+".join(sorted(set(langs_found))) if langs_found else 'unknown'

    # Final dedup key
    dedup_key = f"{clean_title} | {year} | {quality} | {codec} | {season_episode} | {lang}"
    return dedup_key.strip()

def extract_structured_metadata(caption: str):
    caption_lower = caption.lower().replace('.', ' ')

    # --- language normalization ---
    lang_shorthands = {
        'hin': 'hindi', 'hi': 'hindi', 'eng': 'english', 'en': 'english',
        'tam': 'tamil', 'tel': 'telugu', 'ben': 'bengali'
    }
    for short, full in lang_shorthands.items():
        caption_lower = re.sub(rf'\b{short}\b', full, caption_lower)

    # --- patterns ---
    year_pattern    = r'\b(19|20)\d{2}\b'
    quality_pattern = r'\b(240p|360p|480p|540p|720p|1080p|2160p|4k)\b'
    codec_pattern   = r'\b(camrip|webdl|bluray|hdrip|webrip|dvd|brrip|hddvd|hdtv|hdtc|hdts|x265|x264|hevc)\b'

    season_episode = extract_season_episode(caption_lower)

    # --- remove season/episode from title ---
    title_wo_se = re.sub(
        r'(s\d{1,2}\s*e\d{1,2}|s\d{1,2}|e\d{1,2}|part\s*\d{1,2}|\[e\d{1,2}-e\d{1,2}\]|ep\.?\s*\d{1,2}|episode\s*\d{1,2})',
        '',
        caption_lower
    )

    # --- title cleanup ---
    match_positions = []
    for pattern in [year_pattern, quality_pattern, codec_pattern]:
        match = re.search(pattern, title_wo_se)
        if match:
            match_positions.append(match.start())

    cutoff = min(match_positions) if match_positions else len(title_wo_se)
    raw_title = title_wo_se[:cutoff]

    clean_title = re.sub(r'[\[\]\(\)\|:;~_\-]', ' ', raw_title)
    clean_title = re.sub(r'\s+', ' ', clean_title).strip()

    # --- year ---
    y_m = re.search(year_pattern, caption_lower)
    year = y_m.group(0) if y_m else 'unknown'

    # --- quality ---
    q_m = re.search(quality_pattern, caption_lower)
    quality = q_m.group(1) if q_m else 'unknown'

    # --- codec ---
    c_m = re.search(codec_pattern, caption_lower)
    codec = c_m.group(1) if c_m else 'unknown'

    # --- language ---
    languages = [
        'hindi','english','bengali','telugu','tamil','malayalam','kannada','gujarati','marathi','punjabi','urdu','bhojpuri'
    ]
    lang_pattern = r'\b(' + '|'.join(languages) + r')\b'
    langs_found = re.findall(lang_pattern, caption_lower, flags=re.IGNORECASE)
    lang = "+".join(sorted(set(langs_found))) if langs_found else 'unknown'

    # --- season / episode split ---
    season = None
    episode = None
    match = re.match(r's(\d{2})e(\d{2})', season_episode)
    if match:
        season = int(match.group(1))
        episode = int(match.group(2))
 # --- type ---
    type_ = "series" if season_episode != "full" else "movie"
    # --- group key (IMPORTANT) ---
    group_key = f"{clean_title} | {year} | {season_episode} | {lang}"

    # RETURN the extracted data instead of building the record here
    return {
        "title": clean_title,
        "year": year,
        "type": type_,
        "season_episode": season_episode,
        "season": season,
        "episode": episode,
        "quality": quality,
        "codec": codec,
        "language": lang,
        "group_key": group_key
    }

async def index_media(message: Message):
    try:
        document = message.document or message.video or message.audio
        if not document:
            logger.warning("No valid media found in the message.")
            return

        msg_id = message.id
        chat_id = message.chat.id
        file_id = document.file_id
        file_sz = document.file_size

        logger.info(f"Processing message {msg_id} in chat {chat_id}")

        caption = message.caption or ""

        if collection.find_one({"file_id": file_id}):
            logger.info("Duplicate detected by file_id; skipping insert.")
            return

        meta = extract_structured_metadata(caption)
        dedup_key = extract_dedup_key(caption)
        if collection.find_one({"dedup_key": dedup_key}):
            logger.info("Duplicate detected by dedup_key; skipping insert.")
            return

        # FIXED INDENTATION HERE (Ensure it aligns with 8 spaces inside the try block)
        record = {
            "chat_id": chat_id,
            "msg_id": encrypt_msg_id(msg_id),
            "file_id": file_id,
            "file_size": file_sz,
            "caption": caption,

            # NEW structured fields pulled from the 'meta' dictionary
            "title": meta["title"],
            "year": meta["year"],
            "type": meta["type"],

            "season_episode": meta["season_episode"],
            "season": meta["season"],
            "episode": meta["episode"],

            "quality": meta["quality"],
            "codec": meta["codec"],
            "language": meta["language"],

            "group_key": meta["group_key"],
            "dedup_key": dedup_key,
        }

        collection.insert_one(record)
        logger.info(f"Indexed media {msg_id} ")

    except FloodWait as e:
        logger.warning(f"FloodWait: sleeping {e.value}s")
        await asyncio.sleep(e.value)
        await index_media(message)
    except Exception as ex:
        logger.error(f"Indexing error for message {message.id}: {ex}", exc_info=True)

# async def index_media(message: Message):
#     try:
#         document = message.document or message.video or message.audio
#         if not document:
#             logger.warning("No valid media found in the message.")
#             return

#         msg_id = message.id
#         chat_id = message.chat.id
#         file_id = document.file_id
#         file_sz = document.file_size

#         logger.info(f"Processing message {msg_id} in chat {chat_id}")

#         # media_data = await get_media_info(msg_id)
#         # if not media_data:
#         #     logger.warning("Failed to extract media metadata; skipping.")
#         #     return

#         # audio_langs = set()
#         # subtitle_langs = set()
#         # for track in media_data.get("tracks", []):
#         #     lang = track.get("language")
#         #     if not lang:
#         #         continue
#         #     if track.get("track_type") == "Audio":
#         #         audio_langs.add(lang)
#         #     elif track.get("track_type") == "Text":
#         #         subtitle_langs.add(lang)

#         # duration_ms = next((t.get("duration") for t in media_data.get("tracks", []) if t.get("track_type") == "General"), None)

#         caption = message.caption or ""

#         if collection.find_one({"file_id": file_id}):
#             logger.info("Duplicate detected by file_id; skipping insert.")
#             return

#         meta = extract_structured_metadata(caption)
#         dedup_key = extract_dedup_key(caption)
#         if collection.find_one({"dedup_key": dedup_key}):
#             logger.info("Duplicate detected by dedup_key; skipping insert.")
#             return

#       record = {
#     "chat_id": chat_id,
#     "msg_id": encrypt_msg_id(msg_id),
#     "file_id": file_id,
#     "file_size": file_sz,
#     "caption": caption,

#     # NEW structured fields
#     "title": meta["title"],
#     "year": meta["year"],
#     "type": meta["type"],

#     "season_episode": meta["season_episode"],
#     "season": meta["season"],
#     "episode": meta["episode"],

#     "quality": meta["quality"],
#     "codec": meta["codec"],
#     "language": meta["language"],

#     "group_key": meta["group_key"],
#     "dedup_key": dedup_key,
# }

#         collection.insert_one(record)
#         logger.info(f"Indexed media {msg_id} ")

#     except FloodWait as e:
#         logger.warning(f"FloodWait: sleeping {e.value}s")
#         await asyncio.sleep(e.value)
#         await index_media(message)
#     except Exception as ex:
#         logger.error(f"Indexing error for message {message.id}: {ex}", exc_info=True)


@app.on_message(filters.command("ping") & filters.private)
async def ping_handler(client: Client, message: Message):
    await message.reply("🏓 Pong!")


@app.on_message(filters.channel & (filters.document | filters.video | filters.audio))
async def handle_channel_media(client: Client, message: Message):
    logger.info(f"Queued media from channel '{message.chat.title}' (Message ID: {message.id})")
    await media_queue.put(message)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.create_task(index_worker())
    app.run()
