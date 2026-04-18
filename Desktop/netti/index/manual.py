import re
import math
from pyrogram import filters
from pyrogram.handlers import MessageHandler, CallbackQueryHandler
from pyrogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from crypto import encrypt_msg_id
from config import ALLOWED_USER_IDS
from bson import ObjectId

# Options for inline buttons
QUALITY_OPTIONS = ["240p", "360p", "480p", "540p", "720p", "1080p", "2160p", "4k"]
CODEC_OPTIONS = ["camrip", "webdl", "bluray", "hdrip", "webrip", "dvd", "brrip", "hddvd", "hdtv", "hdtc", "hdts", "x265", "x264", "hevc"]
SEASON_OPTIONS = ["full"] + [f"s{str(i).zfill(2)}" for i in range(1, 11)]
LANGUAGES = [
    'hindi','english','bengali','telugu','tamil','malayalam','kannada','gujarati','marathi',
    'punjabi','urdu','bhojpuri','russian','thai','japanese','rajasthani','haryanvi','odia',
    'spanish','french','indonesian','german','italian','portuguese','arabic','chinese','korean',
    'vietnamese','dutch','swedish','norwegian','danish','finnish','polish','ukrainian','greek',
    'hebrew','turkish','persian','czech','romanian','hungarian','serbian'
]

# In-memory session storage
manual_sessions = {}
collection_ref = None

def register_manual_upload(app, collection):
    global collection_ref
    collection_ref = collection

    # Update the handler to include user filter
    app.add_handler(MessageHandler(
        start_manual,
        filters.command("manual") & filters.private & filters.user(ALLOWED_USER_IDS)
    ))
    app.add_handler(MessageHandler(handle_manual_message, filters.private))
    app.add_handler(CallbackQueryHandler(handle_manual_callback))



def build_keyboard(prefix: str, options: list, selected: set = None, multi: bool = False) -> InlineKeyboardMarkup:
    buttons = []
    for opt in options:
        text = f"✅ {opt}" if (selected and opt in selected) else opt
        data = f"{prefix}:{opt}"
        buttons.append(InlineKeyboardButton(text, callback_data=data))
    if multi:
        # Add a Done button for multi-select
        buttons.append(InlineKeyboardButton("Done", callback_data=f"{prefix}_done"))
    # Organize into rows of 3 buttons each
    rows = [buttons[i:i+3] for i in range(0, len(buttons), 3)]
    return InlineKeyboardMarkup(rows)


async def start_manual(client, message):
    chat_id = message.chat.id
    # Initialize session with TITLE state
    manual_sessions[chat_id] = {"state": "TITLE", "data": {}}
    await message.reply("Please enter the title:")


async def handle_manual_message(client, message):
    chat_id = message.chat.id
    if chat_id not in manual_sessions:
        return
    session = manual_sessions[chat_id]
    state = session["state"]
    text = message.text.strip()

    if state == "TITLE":
        session["data"]["title"] = text
        session["state"] = "YEAR"
        await message.reply("Please enter the release year (e.g., 2021):")

    elif state == "YEAR":
        # Validate year
        if not re.fullmatch(r"(?:19|20)\d{2}", text):
            return await message.reply("Invalid year. Please enter a 4-digit year (e.g., 2021):")
        session["data"]["year"] = text
        session["state"] = "QUALITY"
        await message.reply(
            "Select quality:",
            reply_markup=build_keyboard("manual_quality", QUALITY_OPTIONS)
        )

    elif state == "FILE_SIZE":
        # Parse file size and convert to bytes
        m = re.fullmatch(r"([\d.]+)\s*(kb|mb|gb)", text, flags=re.IGNORECASE)
        if not m:
            return await message.reply("Invalid format. Please enter file size like '700MB' or '1.4 GB':")
        num, unit = float(m.group(1)), m.group(2).lower()
        factor = 1024**2 if unit == 'mb' else 1024**3 if unit == 'gb' else 1024
        session["data"]["file_size"] = int(num * factor)
        session["state"] = "LINK"
        await message.reply("Please enter the link or message ID:")

    elif state == "LINK":
        link = text
        data = session["data"]
        # Construct dedup_key
        dedup_key = f"{data['title']} | {data['year']} | {data['quality']} | {data['codec']} | {data['season']} | {data['lang']}"
        record = {
            "chat_id": chat_id,
            "msg_id": encrypt_msg_id(link),
            "file_id": None,
            "file_size": data["file_size"],
            "caption": None,
            "dedup_key": dedup_key
        }
        collection_ref.insert_one(record)
        await message.reply(f"✅ Manual record added with dedup_key:\n`{dedup_key}`")
        # Clean up session
        del manual_sessions[chat_id]


async def handle_manual_callback(client, callback_query):
    chat_id = callback_query.message.chat.id
    if chat_id not in manual_sessions:
        return
    session = manual_sessions[chat_id]
    state = session["state"]
    data_raw = callback_query.data
    await callback_query.answer()

    # QUALITY selection
    if state == "QUALITY" and data_raw.startswith("manual_quality:"):
        val = data_raw.split(':', 1)[1]
        session["data"]["quality"] = val
        session["state"] = "CODEC"
        await callback_query.message.edit_text(
            "Select codec:",
            reply_markup=build_keyboard("manual_codec", CODEC_OPTIONS)
        )

    # CODEC selection
    elif state == "CODEC" and data_raw.startswith("manual_codec:"):
        val = data_raw.split(':', 1)[1]
        session["data"]["codec"] = val
        session["state"] = "SEASON"
        await callback_query.message.edit_text(
            "Select season (or episode part):",
            reply_markup=build_keyboard("manual_season", SEASON_OPTIONS)
        )

    # SEASON selection
    elif state == "SEASON" and data_raw.startswith("manual_season:"):
        val = data_raw.split(':', 1)[1]
        session["data"]["season"] = val
        # Prepare for multi-select languages
        session["data"]["langs"] = set()
        session["state"] = "LANG"
        await callback_query.message.edit_text(
            "Select language(s):",
            reply_markup=build_keyboard("manual_lang", LANGUAGES, selected=session["data"]["langs"], multi=True)
        )

    # LANG multi-select
    elif state == "LANG":
        if data_raw == "manual_lang_done":
            langs = session["data"]["langs"]
            lang_str = "+".join(sorted(langs)) if langs else "unknown"
            session["data"]["lang"] = lang_str
            session["state"] = "FILE_SIZE"
            await callback_query.message.edit_text(
                f"Languages set to {lang_str}.\n\nNow enter the file size (e.g., 700MB):"
            )
        elif data_raw.startswith("manual_lang:"):
            lang = data_raw.split(':', 1)[1]
            if lang in session["data"]["langs"]:
                session["data"]["langs"].remove(lang)
            else:
                session["data"]["langs"].add(lang)
            await callback_query.message.edit_text(
                "Select language(s):",
                reply_markup=build_keyboard("manual_lang", LANGUAGES, selected=session["data"]["langs"], multi=True)
            )

delete_sessions = {}

def register_manual_upload(app, collection):
    global collection_ref
    collection_ref = collection

    # … your existing manual handlers …

    # Register /delete handlers
    app.add_handler(MessageHandler(
        start_delete,
        filters.command("delete") & filters.private & filters.user(ALLOWED_USER_IDS)
    ))
    app.add_handler(MessageHandler(handle_delete_message, filters.private))
    app.add_handler(CallbackQueryHandler(handle_delete_callback))


def build_delete_keyboard(session):
    """Build a paginated multi‑select keyboard for delete."""
    results = session["results"]
    selected = session["selected"]
    page = session["page"]
    page_size = 10

    start = page * page_size
    end = start + page_size
    chunk = results[start:end]

    buttons = []
    for idx, doc in enumerate(chunk, start=start):
        key = doc["dedup_key"]
        text = f"✅ {key}" if idx in selected else key
        buttons.append(
            InlineKeyboardButton(text, callback_data=f"del_sel:{idx}")
        )

    # navigation
    nav_row = []
    if page > 0:
        nav_row.append(InlineKeyboardButton("⏮ Prev", callback_data="del_prev"))
    if end < len(results):
        nav_row.append(InlineKeyboardButton("⏭ Next", callback_data="del_next"))
    # done
    nav_row.append(InlineKeyboardButton("✅ Done", callback_data="del_done"))

    # arrange rows of 2 buttons
    rows = [[btn] for btn in buttons]

    rows.append(nav_row)
    return InlineKeyboardMarkup(rows)


async def start_delete(client, message):
    chat_id = message.chat.id
    delete_sessions[chat_id] = {
        "state": "DEL_TITLE",
        "data": {},
        "results": [],
        "page": 0,
        "selected": set()
    }
    await message.reply("🗑️ *Delete mode.*\nPlease enter the *title* of the media to delete.")


async def handle_delete_message(client, message):
    chat_id = message.chat.id
    if chat_id not in delete_sessions:
        return
    session = delete_sessions[chat_id]
    text = message.text.strip()

    # Step 1: Title
    if session["state"] == "DEL_TITLE":
        session["data"]["title"] = text.lower()
        session["state"] = "DEL_YEAR"
        return await message.reply("Got it. Now enter the *release year* (e.g., 2021):")

    # Step 2: Year
    if session["state"] == "DEL_YEAR":
        if not re.fullmatch(r"(?:19|20)\d{2}|unknown", text.lower()):
            return await message.reply("❌ Invalid year. Enter a 4-digit year (e.g., 2021) or 'unknown'.")
        session["data"]["year"] = text.lower()
        # query DB
        title = re.escape(session["data"]["title"])
        year  = session["data"]["year"]
        print(f"Searching for: {title} | {year}")
        cursor = collection_ref.find({
            "dedup_key": {
                "$regex": f"^{title} \\| {year} \\|",
                "$options": "i"  # <-- This makes it case-insensitive
            }
        })



        docs = list(cursor)
        if not docs:
            delete_sessions.pop(chat_id)
            return await message.reply("No matching records found. ❌")
        # store results
        session["results"] = [{"_id": d["_id"], "dedup_key": d["dedup_key"]} for d in docs]
        session["state"] = "DEL_SELECT"
        # send first page
        await message.reply(
            f"Found {len(docs)} record(s). Select which to delete:",
            reply_markup=build_delete_keyboard(session)
        )


async def handle_delete_callback(client, callback_query):
    chat_id = callback_query.message.chat.id
    if chat_id not in delete_sessions:
        return await callback_query.answer()
    session = delete_sessions[chat_id]
    data = callback_query.data
    await callback_query.answer()

    # toggle selection
    if data.startswith("del_sel:") and session["state"] == "DEL_SELECT":
        idx = int(data.split(":", 1)[1])
        if idx in session["selected"]:
            session["selected"].remove(idx)
        else:
            session["selected"].add(idx)
        return await callback_query.message.edit_reply_markup(
            build_delete_keyboard(session)
        )

    # paginate
    if data == "del_prev" and session["page"] > 0:
        session["page"] -= 1
        return await callback_query.message.edit_reply_markup(
            build_delete_keyboard(session)
        )
    if data == "del_next" and (session["page"]+1)*10 < len(session["results"]):
        session["page"] += 1
        return await callback_query.message.edit_reply_markup(
            build_delete_keyboard(session)
        )

    # done selecting
    if data == "del_done" and session["state"] == "DEL_SELECT":
        if not session["selected"]:
            return await callback_query.answer("You haven't selected anything.", show_alert=True)
        session["state"] = "DEL_CONFIRM"
        # list what will be deleted
        to_delete = [ session["results"][i]["dedup_key"] for i in sorted(session["selected"]) ]
        text = "You are about to delete:\n" + "\n".join(f"- {k}" for k in to_delete)
        kb = InlineKeyboardMarkup([
            [ InlineKeyboardButton("🗑️ Confirm", callback_data="del_confirm"),
              InlineKeyboardButton("❌ Cancel",  callback_data="del_cancel") ]
        ])
        return await callback_query.message.edit_text(text, reply_markup=kb)

    # cancel
    if data == "del_cancel":
        delete_sessions.pop(chat_id, None)
        return await callback_query.message.edit_text("Deletion canceled. ✅")

    # confirm
    if data == "del_confirm":
        # perform deletion
        ids = [ session["results"][i]["_id"] for i in session["selected"] ]
        res = collection_ref.delete_many({ "_id": {"$in": ids} })
        delete_sessions.pop(chat_id, None)
        return await callback_query.message.edit_text(f"✅ Deleted {res.deleted_count} record(s).")
