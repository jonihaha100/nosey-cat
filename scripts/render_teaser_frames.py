import os
import math
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = "/tmp/kepo_frames"
os.makedirs(OUT_DIR, exist_ok=True)

# Colors
INK = (11, 15, 10)
INK_CARD = (20, 28, 20)
INK_BORDER = (40, 56, 38)
LIME = (200, 243, 29)
LIME_GLOW = (140, 220, 30)
WHITE = (245, 242, 232)
MUTED = (139, 155, 133)
BLUE_NEON = (36, 87, 214)
GOLD = (245, 197, 24)
RED_LASER = (255, 60, 60)
CYAN = (0, 220, 255)

# Fonts
FONT_DIR = "/System/Library/Fonts/Supplemental"
font_title = ImageFont.truetype(f"{FONT_DIR}/Arial Black.ttf", 46)
font_h2 = ImageFont.truetype(f"{FONT_DIR}/Arial Black.ttf", 28)
font_card_h = ImageFont.truetype(f"{FONT_DIR}/Arial Black.ttf", 23)
font_body = ImageFont.truetype(f"{FONT_DIR}/Arial Bold.ttf", 20)
font_body_sm = ImageFont.truetype(f"{FONT_DIR}/Arial Bold.ttf", 16)
font_mono = ImageFont.truetype(f"{FONT_DIR}/Courier New Bold.ttf", 18)
font_hud = ImageFont.truetype(f"{FONT_DIR}/Courier New Bold.ttf", 16)

mascot_raw = Image.open("public/mascot-pixel.png").convert("RGBA")

def draw_hud(draw, code, title, status="100% READY"):
    draw.rectangle([60, 35, 1860, 75], fill=(16, 22, 16), outline=INK_BORDER, width=2)
    draw.text((80, 46), f"// {code}", fill=LIME, font=font_hud)
    draw.text((340, 46), f"MISSION: {title}", fill=WHITE, font=font_hud)
    draw.text((1550, 46), f"STATUS: {status}", fill=LIME, font=font_hud)

# ==========================================
# SCENE 1: DOZENS OF MOODS. ONE CURIOUS SNOOT.
# ==========================================
def render_scene_1():
    img = Image.new("RGB", (1920, 1080), color=INK)
    draw = ImageDraw.Draw(img)
    draw_hud(draw, "SNOOT_MATRIX: 01", "16-BIT CHARACTER SPEC & MOODS")

    mood_names = [
        ("CHILL CAT", "DEFAULT SNOOT"),
        ("THUG LIFE", "DEGEN SHADES"),
        ("LASER EYES", "1,000,000 WATTS"),
        ("DEGEN CROWN", "SOLANA KING"),
        ("COFFEE SIPPER", "24/7 LAB GRIND"),
        ("DIAMOND PAWS", "ANTI-JEET SHIELD"),
        ("GREEN CANDLE", "ROCKET MISSION"),
        ("BOOP SNOOT", "CLICKER AWAKENING")
    ]

    card_w = 380
    card_h = 320
    start_x = 120
    start_y = 115
    spacing_x = 55
    spacing_y = 35

    for i, (name, tag) in enumerate(mood_names):
        col = i % 4
        row = i // 4
        x = start_x + col * (card_w + spacing_x)
        y = start_y + row * (card_h + spacing_y)

        draw.rectangle([x, y, x + card_w, y + card_h], fill=INK_CARD, outline=INK_BORDER, width=2)
        draw.rectangle([x, y, x + card_w, y + 36], fill=(24, 34, 24))
        draw.text((x + 16, y + 8), f"MOOD #{i+1:02d} // {name}", fill=LIME, font=font_mono)

        avatar = mascot_raw.copy()
        ad = ImageDraw.Draw(avatar)
        
        if i == 1:
            ad.rectangle([430, 390, 560, 470], fill=(0, 0, 0, 255), outline=(255, 255, 255, 255), width=6)
            ad.rectangle([580, 390, 710, 470], fill=(0, 0, 0, 255), outline=(255, 255, 255, 255), width=6)
            ad.line([560, 420, 580, 420], fill=(255, 255, 255, 255), width=8)
        elif i == 2:
            ad.line([490, 430, 200, 200], fill=RED_LASER, width=16)
            ad.line([650, 430, 900, 150], fill=RED_LASER, width=16)
            ad.ellipse([470, 410, 510, 450], fill=(255, 255, 200))
            ad.ellipse([630, 410, 670, 450], fill=(255, 255, 200))
        elif i == 3:
            ad.polygon([(480, 240), (520, 160), (570, 220), (620, 150), (670, 220), (710, 160), (740, 240)], fill=GOLD, outline=(0, 0, 0), width=6)
            ad.ellipse([595, 175, 615, 195], fill=RED_LASER)
        elif i == 4:
            ad.rectangle([700, 600, 840, 740], fill=(245, 242, 232), outline=(0, 0, 0), width=6)
            ad.text((720, 630), "COFFEE", fill=(0, 0, 0), font=font_card_h)
        elif i == 5:
            ad.polygon([(260, 640), (320, 580), (380, 640), (320, 720)], fill=CYAN, outline=(255, 255, 255), width=6)
            ad.polygon([(680, 640), (740, 580), (800, 640), (740, 720)], fill=CYAN, outline=(255, 255, 255), width=6)
        elif i == 6:
            ad.polygon([(750, 450), (820, 300), (890, 450)], fill=LIME, outline=(0, 0, 0), width=6)
            ad.rectangle([775, 450, 865, 620], fill=LIME, outline=(0, 0, 0), width=6)
        elif i == 7:
            ad.ellipse([540, 490, 600, 540], fill=(255, 105, 180), outline=(255, 255, 255), width=6)

        avatar.thumbnail((200, 200))
        img.paste(avatar, (x + (card_w - avatar.width) // 2, y + 48), avatar)

        draw.rectangle([x + 30, y + 265, x + card_w - 30, y + 300], fill=(16, 22, 16), outline=INK_BORDER, width=1)
        draw.text((x + 45, y + 272), tag, fill=MUTED, font=font_mono)

    pill_w = 560
    pill_x = 960 - pill_w // 2
    draw.rectangle([pill_x, 865, pill_x + pill_w, 925], fill=LIME)
    draw.text((960, 878), "ONE CURIOUS SNOOT.", fill=INK, font=font_h2, anchor="mt")

    draw.text((960, 950), "DOZENS OF MOODS. 16-BIT RETRO ARCADE ON SOLANA.", fill=WHITE, font=font_card_h, anchor="mt")
    img.save(f"{OUT_DIR}/scene_1.jpg")
    print("Rendered scene_1.jpg")

# ==========================================
# SCENE 2: ANTI-RUG PROTOCOL (3 CARDS)
# ==========================================
def render_scene_2():
    img = Image.new("RGB", (1920, 1080), color=INK)
    draw = ImageDraw.Draw(img)
    draw_hud(draw, "PROTOCOL: 02", "ANTI-RUG FAIR LAUNCH SPECIFICATION")

    draw.text((960, 110), "TIRED OF 2-MINUTE RUG PULLS?", fill=WHITE, font=font_title, anchor="mt")
    
    pill_w = 1120
    pill_x = 960 - pill_w // 2
    draw.rectangle([pill_x, 185, pill_x + pill_w, 245], fill=LIME)
    draw.text((960, 198), "MEET $KEPO — REAL 16-BIT SOFTWARE BEFORE TOKEN LAUNCH", fill=INK, font=font_h2, anchor="mt")

    cards = [
        ("01", "100% FAIR LAUNCH", "ZERO INSIDERS. ZERO PRESALES.", [
            "• 1 Billion Total Supply (1,000,000,000 $KEPO)",
            "• 0% Buy Tax & 0% Sell Tax forever",
            "• 100% fair public drop on Pump.fun",
            "• Zero team allocations to dump on holders"
        ], (200, 243, 29)),
        ("02", "LIQUIDITY BURNED", "KEYS THROWN IN THE VOID.", [
            "• 100% Liquidity Pool burned permanently",
            "• Mint & Freeze authorities fully revoked",
            "• Completely unruggable smart contract",
            "• Immutable Solana code, verified & audited"
        ], (255, 120, 30)),
        ("03", "SOFTWARE FIRST", "LIVE ON WEB BEFORE LAUNCH.", [
            "• 16-Bit Retro Arcade Boop Terminal live",
            "• Custom Meme Studio generator online",
            "• 24/7 Cloud AI mascot guardian active",
            "• Real community software, not empty promises"
        ], (0, 220, 255))
    ]

    card_w = 540
    card_h = 560
    start_x = 100
    y = 310
    spacing = 70

    for i, (num, badge, headline, points, color) in enumerate(cards):
        x = start_x + i * (card_w + spacing)

        draw.rectangle([x, y, x + card_w, y + card_h], fill=INK_CARD, outline=INK_BORDER, width=2)
        draw.rectangle([x, y, x + card_w, y + 60], fill=(24, 34, 24))
        draw.rectangle([x + 20, y + 14, x + 70, y + 46], fill=color)
        draw.text((x + 32, y + 18), num, fill=INK, font=font_card_h)
        draw.text((x + 85, y + 20), badge, fill=color, font=font_card_h)

        draw.text((x + 30, y + 90), headline, fill=WHITE, font=font_card_h)
        draw.line([x + 30, y + 135, x + card_w - 30, y + 135], fill=INK_BORDER, width=2)

        cur_y = y + 160
        for pt in points:
            draw.text((x + 30, cur_y), pt, fill=MUTED, font=font_body)
            cur_y += 55

        draw.rectangle([x + 30, y + card_h - 70, x + card_w - 30, y + card_h - 25], fill=(16, 22, 16), outline=color, width=1)
        draw.text((x + 45, y + card_h - 60), f"VERIFIED: {badge}", fill=color, font=font_mono)

    draw.text((960, 940), "100% COMMUNITY-OWNED • ANTI-SNIPER STEALTH DROP ON PUMP.FUN", fill=LIME, font=font_mono, anchor="mt")
    img.save(f"{OUT_DIR}/scene_2.jpg")
    print("Rendered scene_2.jpg")

# ==========================================
# SCENE 3: STEP 01 - 50 DIAMOND PAWS GENESIS
# ==========================================
def render_scene_3():
    img = Image.new("RGB", (1920, 1080), color=INK)
    draw = ImageDraw.Draw(img)
    draw_hud(draw, "STRATEGY: 03", "INVESTOR TARGET & COMMUNITY MILESTONES")

    draw.text((960, 110), "STEP 01: 50 DIAMOND PAWS", fill=WHITE, font=font_title, anchor="mt")
    pill_w = 980
    pill_x = 960 - pill_w // 2
    draw.rectangle([pill_x, 185, pill_x + pill_w, 245], fill=LIME)
    draw.text((960, 198), "COMMUNITY GENESIS ASSEMBLED BEFORE STEALTH LAUNCH", fill=INK, font=font_h2, anchor="mt")

    card_x = 110
    card_y = 280
    card_w = 540
    card_h = 680

    draw.rectangle([card_x, card_y, card_x + card_w, card_y + card_h], fill=(18, 25, 18), outline=CYAN, width=4)
    draw.rectangle([card_x + 10, card_y + 10, card_x + card_w - 10, card_y + card_h - 10], outline=LIME, width=2)
    
    draw.text((card_x + 30, card_y + 25), "GENESIS PASS #001", fill=CYAN, font=font_mono)
    draw.text((card_x + card_w - 180, card_y + 25), "FOUNDER EDITION", fill=GOLD, font=font_mono)

    card_mascot = Image.open("public/banners/kepo-cat-landscape-genesis.jpg").convert("RGB")
    card_mascot = card_mascot.resize((480, 270))
    img.paste(card_mascot, (card_x + 30, card_y + 65))

    draw.text((card_x + 30, card_y + 360), "KEPO CAT // SNOOT RESISTANCE", fill=WHITE, font=font_card_h)
    draw.text((card_x + 30, card_y + 400), "RARITY: GENESIS FOUNDER (1/50)", fill=LIME, font=font_body)
    draw.text((card_x + 30, card_y + 435), "MISSION: CRUSH SNIPER BOTS WITH DIAMOND PAWS", fill=MUTED, font=font_body_sm)

    draw.rectangle([card_x + 30, card_y + 480, card_x + card_w - 30, card_y + 640], fill=INK_CARD, outline=INK_BORDER, width=2)
    draw.text((card_x + 50, card_y + 500), "SQUAD ALLIANCE : 50 DIAMOND PAWS", fill=WHITE, font=font_mono)
    draw.text((card_x + 50, card_y + 540), "NETWORK        : SOLANA / PUMP.FUN", fill=WHITE, font=font_mono)
    draw.text((card_x + 50, card_y + 580), "STATUS         : ASSEMBLED IN THE LAB", fill=LIME, font=font_mono)

    table_x = 710
    table_y = 280
    table_w = 1100
    table_h = 680

    draw.rectangle([table_x, table_y, table_x + table_w, table_y + table_h], fill=INK_CARD, outline=INK_BORDER, width=2)
    draw.rectangle([table_x, table_y, table_x + table_w, table_y + 65], fill=(24, 34, 24))
    draw.text((table_x + 30, table_y + 20), "INVESTOR TARGET SPECIFICATIONS", fill=LIME, font=font_card_h)
    draw.text((table_x + table_w - 240, table_y + 24), "SOLANA MAINNET", fill=MUTED, font=font_mono)

    rows = [
        ("CURRENT MILESTONE", "PHASE 1 (GENESIS 50 SQUAD ASSEMBLY)", CYAN),
        ("NEXT EVENT", "STEALTH PUMP.FUN FAIR DROP", LIME),
        ("TARGET HOLDERS", "50 VERIFIED DIAMOND PAWS ON TELEGRAM & X", WHITE),
        ("TOTAL SUPPLY", "1,000,000,000 $KEPO (1 BILLION)", GOLD),
        ("BUY / SELL TAX", "0% TAX (100% UNTAXED TRADING)", LIME),
        ("LIQUIDITY POOL", "100% BURNED PERMANENTLY AT LAUNCH", RED_LASER),
        ("TEAM ALLOCATION", "0% (ZERO INSIDER DUMPING)", LIME),
        ("CONTRACT AUDIT", "IMMUTABLE & UNRUGGABLE CODE", CYAN)
    ]

    row_y = table_y + 90
    for label, val, color in rows:
        draw.line([table_x + 20, row_y - 8, table_x + table_w - 20, row_y - 8], fill=INK_BORDER, width=1)
        draw.text((table_x + 40, row_y + 5), label, fill=MUTED, font=font_mono)
        draw.text((table_x + 420, row_y + 5), val, fill=color, font=font_body)
        row_y += 65

    img.save(f"{OUT_DIR}/scene_3.jpg")
    print("Rendered scene_3.jpg")

# ==========================================
# SCENE 4: THE ECOSYSTEM NODE GRAPH
# ==========================================
def render_scene_4():
    img = Image.new("RGB", (1920, 1080), color=INK)
    draw = ImageDraw.Draw(img)
    draw_hud(draw, "ARCHITECTURE: 04", "INTERACTIVE ECOSYSTEM NODE NETWORK")

    # Header placed high with ample room
    draw.text((960, 95), "MORE THAN A MEME.", fill=WHITE, font=font_title, anchor="mt")
    pill_w = 780
    pill_x = 960 - pill_w // 2
    draw.rectangle([pill_x, 155, pill_x + pill_w, 210], fill=LIME)
    draw.text((960, 168), "A COMPLETE 16-BIT RETRO ECOSYSTEM", fill=INK, font=font_h2, anchor="mt")

    # Center Hub lowered to 640
    cx, cy = 960, 640
    r_center = 110

    nodes = [
        ("[BOOP CLICKER]", "Live 16-bit arcade boop web terminal", (200, 243, 29)),
        ("[MEME STUDIO]", "Custom pixel degen meme generator", (0, 220, 255)),
        ("[HERMES AI AGENT]", "24/7 cloud sentinel @nesey_cat_bot", (245, 197, 24)),
        ("[PUMP.FUN STEALTH]", "Anti-sniper 100% fair launch", (255, 120, 30)),
        ("[RAYDIUM POOL]", "Automated LP lock & fast track", (200, 243, 29)),
        ("[ARCADE QUESTS]", "Web3 leaderboard & holder perks", (0, 220, 255)),
    ]

    angle_step = 2 * math.pi / len(nodes)
    dist = 360

    for i, (title, desc, color) in enumerate(nodes):
        angle = i * angle_step - math.pi / 2
        nx = int(cx + dist * math.cos(angle))
        ny = int(cy + dist * math.sin(angle))

        draw.line([cx, cy, nx, ny], fill=(24, 38, 24), width=8)
        draw.line([cx, cy, nx, ny], fill=color, width=2)

        bw, bh = 310, 95
        bx = nx - bw // 2
        by = ny - bh // 2

        draw.rectangle([bx, by, bx + bw, by + bh], fill=INK_CARD, outline=color, width=2)
        draw.rectangle([bx, by, bx + bw, by + 32], fill=(24, 34, 24))
        draw.text((bx + 15, by + 6), title, fill=color, font=font_body)
        draw.text((bx + 15, by + 42), desc, fill=WHITE, font=font_body_sm)

    draw.ellipse([cx - r_center - 8, cy - r_center - 8, cx + r_center + 8, cy + r_center + 8], outline=LIME, width=4)
    draw.ellipse([cx - r_center, cy - r_center, cx + r_center, cy + r_center], fill=INK_CARD, outline=WHITE, width=2)
    
    center_avatar = mascot_raw.copy().resize((150, 150))
    img.paste(center_avatar, (cx - 75, cy - 85), center_avatar)
    draw.text((cx, cy + 75), "$KEPO CORE", fill=LIME, font=font_card_h, anchor="mt")

    img.save(f"{OUT_DIR}/scene_4.jpg")
    print("Rendered scene_4.jpg")

# ==========================================
# SCENE 5: LAUNCHPAD & CALL TO ACTION
# ==========================================
def render_scene_5():
    img = Image.open("public/banners/nosey-moon-mission-1080p.png").convert("RGB")
    draw = ImageDraw.Draw(img)
    draw_hud(draw, "OUTRO: 05", "OFFICIAL LAUNCHPAD & COMMUNITY LINKS")

    card_w = 1140
    card_h = 560
    cx = 960 - card_w // 2
    cy = 530 - card_h // 2

    overlay = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([cx, cy, cx + card_w, cy + card_h], fill=(11, 15, 10, 240), outline=LIME, width=4)
    od.rectangle([cx + 10, cy + 10, cx + card_w - 10, cy + card_h - 10], outline=INK_BORDER, width=2)
    
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    draw.rectangle([cx + 40, cy + 35, cx + 290, cy + 75], fill=LIME)
    draw.text((cx + 55, cy + 45), "STATUS: 100% READY", fill=INK, font=font_mono)

    draw.text((cx + 40, cy + 95), "JOIN THE 16-BIT RESISTANCE", fill=WHITE, font=font_title)
    draw.text((cx + 40, cy + 160), "Curiosity didn't kill this cat — it sent him to the moon on Solana!", fill=LIME, font=font_h2)

    links = [
        ("[WEB] OFFICIAL WEBSITE", "https://nosey-cat.vercel.app"),
        ("[X]   TWITTER / X", "https://x.com/TheNoseyCat"),
        ("[TG]  TELEGRAM SQUAD", "https://t.me/TheNoseyCat"),
        ("[BOT] 24/7 AI AGENT", "@nesey_cat_bot on Telegram")
    ]

    cur_y = cy + 240
    for label, val in links:
        draw.rectangle([cx + 40, cur_y, cx + card_w - 40, cur_y + 54], fill=INK_CARD, outline=INK_BORDER, width=2)
        draw.text((cx + 65, cur_y + 16), label, fill=LIME, font=font_mono)
        draw.text((cx + 420, cur_y + 16), val, fill=WHITE, font=font_body)
        cur_y += 66

    draw.text((960, cy + card_h + 20), "STEALTH FAIR LAUNCH ON PUMP.FUN • 0% TAX • BURNED LP", fill=WHITE, font=font_mono, anchor="mt")

    img.save(f"{OUT_DIR}/scene_5.jpg")
    print("Rendered scene_5.jpg")

render_scene_1()
render_scene_2()
render_scene_3()
render_scene_4()
render_scene_5()
