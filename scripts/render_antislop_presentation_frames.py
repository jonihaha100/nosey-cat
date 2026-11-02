import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/tmp/antislop_scenes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1920x1080 resolution
W, H = 1920, 1080

# Colors
C_LIGHT_BG = (239, 236, 230)      # Studio warm off-white #EFECE6
C_DARK_BG = (17, 20, 19)          # Deep tactical slate #111413
C_CARD_DARK = (24, 28, 27)        # Slate card background
C_CARD_LIGHT = (248, 247, 244)    # Light card background
C_BORDER_DARK = (45, 55, 52)      # Dark card borders
C_BORDER_LIGHT = (215, 212, 205)  # Light card borders
C_LIME = (200, 249, 0)            # Electric Lime #C8F900
C_GREEN_LINE = (50, 180, 80)      # Tactical green line
C_TEXT_DARK = (245, 246, 245)     # Primary white on dark
C_TEXT_LIGHT = (18, 20, 19)       # Primary dark on light
C_MUTED_DARK = (130, 145, 140)    # Subtext on dark
C_MUTED_LIGHT = (110, 115, 112)   # Subtext on light

# Fonts
FONT_HELVETICA = "/System/Library/Fonts/Helvetica.ttc"
FONT_MENLO = "/System/Library/Fonts/Menlo.ttc"
FONT_RETRO = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/scratch/PressStart2P.ttf"

def get_font(path, size, index=0):
    try:
        return ImageFont.truetype(path, size, index=index)
    except:
        return ImageFont.load_default()

font_title_lg = get_font(FONT_HELVETICA, 44)
font_title_md = get_font(FONT_HELVETICA, 36)
font_title_sm = get_font(FONT_HELVETICA, 26)
font_body = get_font(FONT_HELVETICA, 18)
font_body_sm = get_font(FONT_HELVETICA, 15)
font_mono = get_font(FONT_MENLO, 14)
font_mono_lg = get_font(FONT_MENLO, 18)
font_pill = get_font(FONT_HELVETICA, 22)
font_pill_sm = get_font(FONT_HELVETICA, 14)

# Load isolated cat mascot
cat_img_path = "/tmp/cat_isolated.png"
if os.path.exists(cat_img_path):
    cat_master = Image.open(cat_img_path).convert("RGBA")
else:
    cat_master = Image.open("public/mascot-pixel.png").convert("RGBA")

def draw_hud_corners(draw, w, h, is_dark=True, pad=35, length=24):
    color = C_MUTED_DARK if is_dark else C_MUTED_LIGHT
    draw.line([(pad, pad), (pad + length, pad)], fill=color, width=2)
    draw.line([(pad, pad), (pad, pad + length)], fill=color, width=2)
    draw.line([(w - pad, pad), (w - pad - length, pad)], fill=color, width=2)
    draw.line([(w - pad, pad), (w - pad, pad + length)], fill=color, width=2)
    draw.line([(pad, h - pad), (pad + length, h - pad)], fill=color, width=2)
    draw.line([(pad, h - pad), (pad, h - pad - length)], fill=color, width=2)
    draw.line([(w - pad, h - pad), (w - pad - length, h - pad)], fill=color, width=2)
    draw.line([(w - pad, h - pad), (w - pad, h - pad - length)], fill=color, width=2)

def draw_hud_header(draw, left_text, right_text, is_dark=True):
    color = C_MUTED_DARK if is_dark else C_MUTED_LIGHT
    draw.text((45, 30), left_text, font=font_mono, fill=color)
    r_bbox = font_mono.getbbox(right_text)
    rw = r_bbox[2] - r_bbox[0]
    draw.text((W - 45 - rw, 30), right_text, font=font_mono, fill=color)

def draw_pill(draw, x, y, text, font, bg_color=C_LIME, text_color=(0, 0, 0), px=20, py=7):
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    w = tw + px * 2
    h = th + py * 2
    r = h // 2
    draw.rounded_rectangle([x - w // 2, y, x + w // 2, y + h], radius=r, fill=bg_color)
    tx = x - tw // 2
    ty = y + py - 2
    draw.text((tx, ty), text, font=font, fill=text_color)
    return h

def draw_bottom_caption(draw, main_text, pill_text, is_dark=True):
    # Main text centered
    main_color = C_TEXT_DARK if is_dark else C_TEXT_LIGHT
    bbox = font_title_md.getbbox(main_text)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 930), main_text, font=font_title_md, fill=main_color)
    # Lime pill below
    draw_pill(draw, W // 2, 985, pill_text, font_pill, bg_color=C_LIME, text_color=(0, 0, 0))

# ==============================================================================
# SCENE 1: DOZENS OF MOODS. ONE CURIOUS SNOOT.
# ==============================================================================
def render_scene1():
    img = Image.new("RGB", (W, H), C_LIGHT_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=False)
    draw_hud_header(draw, "// 01 // ARCHETYPE SYSTEM // PROTOCOL: KEPO", "SERIES: GENESIS [3x6 GRID]", is_dark=False)

    # 18 Mood cards: 3 rows, 6 columns
    grid_w = 6
    grid_h = 3
    card_w = 230
    card_h = 220
    gap_x = 35
    gap_y = 35

    total_gw = grid_w * card_w + (grid_w - 1) * gap_x
    start_x = (W - total_gw) // 2
    start_y = 100

    mood_labels = [
        ("01", "CHILL CAT", True, "SERIES 01"),
        ("02", "CURIOUS", False, ""),
        ("03", "BULLISH", False, ""),
        ("04", "1M WATT LASER", False, ""),
        ("05", "DEGEN COFFEE", False, ""),
        ("06", "DIAMOND PAWS", False, ""),
        ("07", "SNOOT BOOP", False, ""),
        ("08", "LAB DEV", True, "CHILLCAT V1"),
        ("09", "THUG LIFE", False, ""),
        ("10", "GREEN CANDLE", False, ""),
        ("11", "PIZZA TIME", False, ""),
        ("12", "HODL SQUAD", False, ""),
        ("13", "MOON MISSION", False, ""),
        ("14", "ANTI-JEET", True, "SPECIAL ED"),
        ("15", "NIGHT OWL", False, ""),
        ("16", "CYBER MATRIX", False, ""),
        ("17", "MEME KING", False, ""),
        ("18", "100% READY", False, "")
    ]

    # Pre-crop cat face
    cw, ch = cat_master.size
    cat_face = cat_master.crop((int(cw * 0.18), int(ch * 0.05), int(cw * 0.88), int(ch * 0.65)))

    idx = 0
    for r in range(grid_h):
        for c in range(grid_w):
            x = start_x + c * (card_w + gap_x)
            y = start_y + r * (card_h + gap_y)

            num, label, has_tag, tag_text = mood_labels[idx]

            # Card background
            draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=6, fill=C_CARD_LIGHT, outline=C_BORDER_LIGHT, width=2)

            if has_tag:
                # Highlight green border
                draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=6, outline=C_LIME, width=3)
                # Green badge tab at top
                draw.rectangle([x + 10, y - 10, x + 100, y + 8], fill=C_LIME)
                draw.text((x + 16, y - 8), tag_text, font=get_font(FONT_MENLO, 10), fill=(0, 0, 0))

            # Render distinct cat thumbnail inside
            thumb = cat_face.resize((140, 130), Image.Resampling.LANCZOS)
            
            # Apply distinct accessories based on mood
            thumb_draw = ImageDraw.Draw(thumb)
            if idx == 1: # Curious: zoom in
                thumb = cat_face.crop((30, 20, cat_face.width - 30, cat_face.height - 20)).resize((140, 130), Image.Resampling.LANCZOS)
                thumb_draw = ImageDraw.Draw(thumb)
            elif idx == 3: # 1M WATT LASER
                thumb_draw.line([(45, 45), (140, 30)], fill=(0, 255, 200, 255), width=4)
                thumb_draw.line([(85, 45), (140, 40)], fill=(0, 255, 200, 255), width=4)
            elif idx == 4: # Degen Coffee
                thumb_draw.rectangle([10, 80, 45, 115], fill=(220, 200, 180), outline=(80, 50, 20), width=2)
                thumb_draw.text((15, 85), "☕", font=get_font(FONT_HELVETICA, 16), fill=(60, 30, 10))
            elif idx == 8: # Thug Life Shades
                thumb_draw.rectangle([35, 42, 60, 58], fill=(0, 0, 0))
                thumb_draw.rectangle([70, 42, 95, 58], fill=(0, 0, 0))
                thumb_draw.line([(55, 50), (75, 50)], fill=(0, 0, 0), width=3)
            elif idx == 9: # Green candle
                thumb_draw.rectangle([115, 20, 130, 90], fill=(0, 220, 100))
                thumb_draw.line([(122, 10), (122, 100)], fill=(0, 220, 100), width=2)
            elif idx == 13: # Anti-Jeet Shield
                thumb_draw.ellipse([5, 40, 45, 80], fill=(0, 180, 255, 200), outline=(255, 255, 255), width=2)
                thumb_draw.text((12, 48), "🛡️", font=get_font(FONT_HELVETICA, 18), fill=(255, 255, 255))

            # Composite thumbnail
            tx = x + (card_w - 140) // 2
            ty = y + 20
            img.paste(thumb, (tx, ty), thumb)

            # Label at bottom of card
            draw.text((x + 12, y + card_h - 32), num, font=get_font(FONT_MENLO, 11), fill=C_MUTED_LIGHT)
            draw.text((x + 36, y + card_h - 32), label, font=get_font(FONT_HELVETICA, 12), fill=C_TEXT_LIGHT)

            idx += 1

    draw_bottom_caption(draw, "DOZENS OF MOODS.", "ONE CURIOUS SNOOT.", is_dark=False)
    img.save(os.path.join(OUTPUT_DIR, "scene1_moods.png"))
    print("Scene 1 rendered.")

# ==============================================================================
# SCENE 2: REAL SOFTWARE FIRST, MEME COIN SECOND
# ==============================================================================
def render_scene2():
    img = Image.new("RGB", (W, H), C_DARK_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=True)
    draw_hud_header(draw, "// 02 // PROBLEM ARCHITECTURE // AUDITED LIVE", "STATUS: 100% VERIFIED", is_dark=True)

    # 3 Large Cards
    card_w = 540
    card_h = 600
    gap = 50
    total_w = 3 * card_w + 2 * gap
    start_x = (W - total_w) // 2
    start_y = 170

    cards_data = [
        (
            "01",
            "TESTED IN THE OPEN",
            "PUBLIC CHECKLIST, PUBLIC SCORES",
            "Live 16-bit retro software and sound engine deployed on the web before token creation.",
            "• Playable Arcade Boop Engine\n• Client-Side Meme Studio\n• Sound FX Synthesizer",
            "TERMINAL"
        ),
        (
            "02",
            "EVERYONE HEARS AT ONCE",
            "NO EARLY DIPS, 100% INCLUDED",
            "No private VC rounds. No secret influencer allocations. Zero presale tokens held by team.",
            "• 100% Fair Launch on Pump.fun\n• Zero Insider Whitelist\n• Public Telegram & X Alpha",
            "SHIELD"
        ),
        (
            "03",
            "VERIFIABLE IMMUTABILITY",
            "0% TAX • 100% LP BURNED FOREVER",
            "Strict anti-rug parameters hardcoded and permanently locked upon Solana migration.",
            "• 0% Buy / Sell Trading Tax\n• 100% Raydium LP Burned\n• Renounced Mint Authority",
            "LOCK"
        )
    ]

    for i, (num, title, tag, desc, bullets, icon_type) in enumerate(cards_data):
        x = start_x + i * (card_w + gap)
        y = start_y

        # Card container
        draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=10, fill=C_CARD_DARK, outline=C_BORDER_DARK, width=2)

        # Lime corner tag
        draw.rectangle([x + 25, y - 12, x + 75, y + 10], fill=C_LIME)
        draw.text((x + 35, y - 10), num, font=get_font(FONT_MENLO, 12), fill=(0, 0, 0))

        # Icon box
        ib_x, ib_y = x + 30, y + 35
        draw.rounded_rectangle([ib_x, ib_y, ib_x + 80, ib_y + 80], radius=8, fill=(30, 38, 35), outline=C_LIME, width=2)
        
        # Draw clean vector icons
        if icon_type == "TERMINAL":
            # >_ terminal prompt
            draw.text((ib_x + 18, ib_y + 14), ">_", font=get_font(FONT_MENLO, 38), fill=C_LIME)
        elif icon_type == "SHIELD":
            # Clean shield vector
            sx, sy = ib_x + 40, ib_y + 20
            draw.polygon([(sx, sy), (sx + 24, sy + 10), (sx + 24, sy + 35), (sx, sy + 50), (sx - 24, sy + 35), (sx - 24, sy + 10)], outline=C_LIME, width=3)
            draw.text((sx - 7, sy + 12), "✓", font=get_font(FONT_HELVETICA, 24), fill=C_LIME)
        elif icon_type == "LOCK":
            # Clean padlock vector
            lx, ly = ib_x + 22, ib_y + 36
            draw.rounded_rectangle([lx, ly, lx + 36, ly + 32], radius=4, fill=C_LIME)
            draw.arc([lx + 6, ly - 18, lx + 30, ly + 6], start=180, end=0, fill=C_LIME, width=4)

        # Title
        draw.text((x + 30, y + 140), title, font=font_title_sm, fill=C_TEXT_DARK)
        draw.text((x + 30, y + 180), tag, font=get_font(FONT_MENLO, 13), fill=C_LIME)

        # Divider line
        draw.line([(x + 30, y + 215), (x + card_w - 30, y + 215)], fill=C_BORDER_DARK, width=2)

        # Description
        # Wrap desc
        words = desc.split()
        lines = []
        cur = ""
        for w in words:
            if len(cur + " " + w) < 42:
                cur = cur + " " + w if cur else w
            else:
                lines.append(cur)
                cur = w
        if cur: lines.append(cur)

        dy = y + 235
        for l in lines:
            draw.text((x + 30, dy), l, font=font_body, fill=C_TEXT_DARK)
            dy += 28

        # Bullets box
        dy += 20
        draw.rounded_rectangle([x + 25, dy, x + card_w - 25, dy + 140], radius=6, fill=(15, 18, 17), outline=C_BORDER_DARK, width=1)
        b_lines = bullets.split("\n")
        by = dy + 20
        for bl in b_lines:
            draw.text((x + 40, by), bl, font=font_body_sm, fill=C_MUTED_DARK)
            by += 34

    draw_bottom_caption(draw, "REAL SOFTWARE FIRST, MEME COIN SECOND", "FED UP WITH 2-MINUTE RUGS. HERE TO BACK REAL ONES.", is_dark=True)
    img.save(os.path.join(OUTPUT_DIR, "scene2_problem.png"))
    print("Scene 2 rendered.")

# ==============================================================================
# SCENE 3: STEP 01: THE PASS MINT (50 DIAMOND PAWS ASSEMBLY)
# ==============================================================================
def render_scene3():
    img = Image.new("RGB", (W, H), C_DARK_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=True)
    draw_hud_header(draw, "// 03 // PHASE 01 PROTOCOL // ASSEMBLY", "STEP: 01 OF 02 [PASS MINT]", is_dark=True)

    # Left: Founder's Pass Card
    card_x = 180
    card_y = 140
    card_w = 480
    card_h = 680

    # Green outer boundary
    draw.rounded_rectangle([card_x, card_y, card_x + card_w, card_y + card_h], radius=12, fill=C_CARD_DARK, outline=C_LIME, width=3)
    # Header tag
    draw.rectangle([card_x + 30, card_y - 12, card_x + 320, card_y + 12], fill=C_LIME)
    draw.text((card_x + 40, card_y - 9), "KEPO CAT PASS: FOUNDER'S EDITION", font=get_font(FONT_MENLO, 11), fill=(0, 0, 0))

    # Inner artwork: load diamond paws banner
    saga_path = "public/banners/nosey-saga-ch3-diamond-paws.jpg"
    if os.path.exists(saga_path):
        saga_img = Image.open(saga_path).convert("RGBA")
        saga_crop = saga_img.resize((card_w - 40, card_h - 80), Image.Resampling.LANCZOS)
        img.paste(saga_crop, (card_x + 20, card_y + 25))

    # Right: Technical Specification Table
    tbl_x = 760
    tbl_y = 150

    draw.text((tbl_x, tbl_y), "MINT A SNOOT.", font=get_font(FONT_HELVETICA, 48), fill=C_TEXT_DARK)
    draw.text((tbl_x, tbl_y + 60), "CLAIM AT LAUNCH.", font=get_font(FONT_HELVETICA, 48), fill=C_LIME)

    # Spec rows
    specs = [
        ("PASSES", "50 DIAMOND PAWS"),
        ("PRICE", "0.00 SOL (FAIR REPUTATION DROP)"),
        ("LIMIT", "1 PER CONVICTION SQUAD"),
        ("EACH PASS CLAIMS", "20,000,000 $KEPO (100% CLAIM)"),
        ("NETWORK", "SOLANA // PUMP.FUN"),
        ("SECURITY", "0% TAX • 100% LP BURN PROTOCOL")
    ]

    sy = tbl_y + 160
    for label, val in specs:
        draw.line([(tbl_x, sy + 38), (tbl_x + 900, sy + 38)], fill=C_BORDER_DARK, width=1)
        draw.text((tbl_x, sy), label, font=get_font(FONT_MENLO, 15), fill=C_MUTED_DARK)
        v_bbox = font_mono_lg.getbbox(val)
        vw = v_bbox[2] - v_bbox[0]
        val_color = C_LIME if "20,000,000" in val or "50" in val else C_TEXT_DARK
        draw.text((tbl_x + 900 - vw, sy), val, font=font_mono_lg, fill=val_color)
        sy += 65

    draw_bottom_caption(draw, "STEP 01: THE 50 DIAMOND PAWS", "50 PASSES FUND THE LAUNCH & SECURE CONVICTION", is_dark=True)
    img.save(os.path.join(OUTPUT_DIR, "scene3_step01.png"))
    print("Scene 3 rendered.")

# ==============================================================================
# SCENE 4: STEP 02: SELL OUT, THEN LAUNCH (TRANSPARENT DISTRIBUTION MATH)
# ==============================================================================
def render_scene4():
    img = Image.new("RGB", (W, H), C_LIGHT_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=False)
    draw_hud_header(draw, "// 04 // TOKENOMICS & MIGRATION MODEL", "CHAIN: SOLANA // TOTAL: 1,000,000,000", is_dark=False)

    # 3 Flowchart boxes
    box_w = 460
    box_h = 240
    gap = 90
    total_w = 3 * box_w + 2 * gap
    start_x = (W - total_w) // 2
    start_y = 180

    flow_data = [
        ("01 ASSEMBLE", "50 / 50", "DIAMOND PAWS VANGUARD", False),
        ("02 LAUNCH", "$KEPO", "FAIR LAUNCH ON PUMP.FUN", True),
        ("03 BURN & LOCK", "100%", "RAYDIUM LP BURN PROTOCOL", False)
    ]

    for i, (tag, val, subtitle, is_icon) in enumerate(flow_data):
        x = start_x + i * (box_w + gap)
        y = start_y

        draw.rounded_rectangle([x, y, x + box_w, y + box_h], radius=8, fill=C_CARD_LIGHT, outline=C_BORDER_LIGHT, width=2)
        # Green tag
        draw.rectangle([x + 20, y - 10, x + 160, y + 10], fill=C_LIME)
        draw.text((x + 28, y - 8), tag, font=get_font(FONT_MENLO, 12), fill=(0, 0, 0))

        if is_icon:
            # Circle with cat
            cx, cy = x + box_w // 2, y + 80
            draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill=C_LIME)
            # paste cat inside
            cat_icon = cat_master.crop((int(cat_master.width * 0.2), 0, int(cat_master.width * 0.8), int(cat_master.height * 0.6))).resize((70, 70), Image.Resampling.LANCZOS)
            img.paste(cat_icon, (cx - 35, cy - 35), cat_icon)
            draw.text((x + (box_w - font_title_sm.getbbox(val)[2] + font_title_sm.getbbox(val)[0]) // 2, y + 140), val, font=font_title_sm, fill=C_TEXT_LIGHT)
        else:
            draw.text((x + (box_w - font_title_lg.getbbox(val)[2] + font_title_lg.getbbox(val)[0]) // 2, y + 60), val, font=font_title_lg, fill=C_TEXT_LIGHT)

        draw.text((x + (box_w - font_mono.getbbox(subtitle)[2] + font_mono.getbbox(subtitle)[0]) // 2, y + 185), subtitle, font=font_mono, fill=C_MUTED_LIGHT)

        # Connector arrow
        if i < 2:
            ax = x + box_w + 15
            ay = y + box_h // 2
            draw.text((ax, ay - 12), "····▶", font=get_font(FONT_MENLO, 22), fill=C_MUTED_LIGHT)

    # Big Transparent Math Box
    math_y = 520
    draw.rounded_rectangle([start_x, math_y, start_x + total_w, math_y + 260], radius=10, fill=C_CARD_LIGHT, outline=C_BORDER_LIGHT, width=2)

    eq_line1 = "50 PASSES  ×  20,000,000 $KEPO  =  1,000,000,000"
    draw.text((start_x + (total_w - font_title_md.getbbox(eq_line1)[2] + font_title_md.getbbox(eq_line1)[0]) // 2, math_y + 50), eq_line1, font=font_title_md, fill=C_TEXT_LIGHT)

    eq_line2 = "100% OF THE 1,000,000,000 TOTAL SUPPLY CIRCULATING AT FAIR LAUNCH"
    draw.text((start_x + (total_w - font_mono_lg.getbbox(eq_line2)[2] + font_mono_lg.getbbox(eq_line2)[0]) // 2, math_y + 125), eq_line2, font=font_mono_lg, fill=C_GREEN_LINE)

    eq_line3 = "0% DEV TAX • 0% PRESALE DUMP • 100% RAYDIUM LP PERMANENTLY BURNED"
    draw.text((start_x + (total_w - font_mono.getbbox(eq_line3)[2] + font_mono_lg.getbbox(eq_line3)[0]) // 2, math_y + 180), eq_line3, font=font_mono, fill=C_MUTED_LIGHT)

    draw_bottom_caption(draw, "STEP 02: SELL OUT, THEN LAUNCH", "EVERY PASS CLAIMS 20,000,000 $KEPO // 100% FAIR LIQUIDITY", is_dark=False)
    img.save(os.path.join(OUTPUT_DIR, "scene4_step02.png"))
    print("Scene 4 rendered.")

# ==============================================================================
# SCENE 5: 6-NODE ECOSYSTEM ARCHITECTURE
# ==============================================================================
def render_scene5():
    img = Image.new("RGB", (W, H), C_DARK_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=True)
    draw_hud_header(draw, "// 05 // SYSTEM TOPOLOGY // LIVE ON MAINNET", "NODES: 6 OPERATIONAL [100% ONLINE]", is_dark=True)

    cx, cy = W // 2, 450
    hub_w, hub_h = 320, 240
    node_w, node_h = 360, 140

    # 6 Satellite Nodes (3 Left, 3 Right)
    nodes = [
        # Left side
        ("ARCADE BOOP TERMINAL", "PLAYABLE 16-BIT TERMINAL", 300, 240),
        ("MEME STUDIO ENGINE", "CLIENT-SIDE CANVAS MAKER", 260, 450),
        ("SOLANA RADAR", "24/7 LIVE DEGEN METRICS", 300, 660),
        # Right side
        ("HERMES AI SENTINEL", "24/7 COMMUNITY AGENT", 1620, 240),
        ("DIAMOND PAWS SAGA", "16-BIT LORE & COLLECTIBLES", 1660, 450),
        ("RAYDIUM DEX PROTOCOL", "BURNED LIQUIDITY POOL", 1620, 660)
    ]

    # Draw connecting lines first so they sit behind cards
    for title, subtitle, nx, ny in nodes:
        draw.line([(nx, ny), (cx, cy)], fill=(40, 75, 55), width=2)

    # Center Hub: $KEPO CORE (drawn on top of lines)
    draw.rounded_rectangle([cx - hub_w // 2, cy - hub_h // 2, cx + hub_w // 2, cy + hub_h // 2], radius=12, fill=C_CARD_DARK, outline=C_LIME, width=3)
    draw.rectangle([cx - 80, cy - hub_h // 2 - 12, cx + 80, cy - hub_h // 2 + 10], fill=C_LIME)
    draw.text((cx - 50, cy - hub_h // 2 - 9), "CORE PROTOCOL", font=get_font(FONT_MENLO, 11), fill=(0, 0, 0))

    # Center circle logo
    draw.ellipse([cx - 50, cy - 65, cx + 50, cy + 35], fill=C_LIME)
    cat_icon = cat_master.crop((int(cat_master.width * 0.2), 0, int(cat_master.width * 0.8), int(cat_master.height * 0.6))).resize((80, 80), Image.Resampling.LANCZOS)
    img.paste(cat_icon, (cx - 40, cy - 55), cat_icon)

    draw.text((cx - font_title_sm.getbbox("$KEPO CORE")[2] // 2, cy + 50), "$KEPO CORE", font=font_title_sm, fill=C_TEXT_DARK)
    draw.text((cx - font_mono.getbbox("RETRO ARCADE HUB")[2] // 2, cy + 85), "RETRO ARCADE HUB", font=font_mono, fill=C_MUTED_DARK)

    # Satellite node cards drawn on top of lines
    for title, subtitle, nx, ny in nodes:
        draw.rounded_rectangle([nx - node_w // 2, ny - node_h // 2, nx + node_w // 2, ny + node_h // 2], radius=8, fill=C_CARD_DARK, outline=C_BORDER_DARK, width=2)
        # Node corner tag
        draw.rectangle([nx - node_w // 2 + 15, ny - node_h // 2 - 8, nx - node_w // 2 + 85, ny - node_h // 2 + 8], fill=C_LIME)
        draw.text((nx - node_w // 2 + 22, ny - node_h // 2 - 6), "ACTIVE", font=get_font(FONT_MENLO, 9), fill=(0, 0, 0))

        draw.text((nx - font_title_sm.getbbox(title)[2] // 2, ny - 20), title, font=get_font(FONT_HELVETICA, 20), fill=C_TEXT_DARK)
        draw.text((nx - font_mono.getbbox(subtitle)[2] // 2, ny + 18), subtitle, font=get_font(FONT_MENLO, 12), fill=C_LIME)

    draw_bottom_caption(draw, "NOT AN EMPTY PROMISE. A WORKING ECOSYSTEM.", "6 UTILITIES BUILT AND DEPLOYED BEFORE TOKEN LAUNCH", is_dark=True)
    img.save(os.path.join(OUTPUT_DIR, "scene5_ecosystem.png"))
    print("Scene 5 rendered.")

# ==============================================================================
# SCENE 6: LIVE WEBSITE PRODUCT PROOF (MACBOOK BROWSER UI)
# ==============================================================================
def render_scene6():
    img = Image.new("RGB", (W, H), C_LIGHT_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=False)
    draw_hud_header(draw, "// 06 // CLIENT VERIFICATION // LIVE URL", "SECURE SSL: ENCRYPTED // ONLINE", is_dark=False)

    # MacBook Browser Mockup Window
    win_w = 1480
    win_h = 750
    win_x = (W - win_w) // 2
    win_y = 120

    # Window shadow
    draw.rounded_rectangle([win_x + 8, win_y + 12, win_x + win_w + 8, win_y + win_h + 12], radius=14, fill=(210, 206, 198))
    # Window base
    draw.rounded_rectangle([win_x, win_y, win_x + win_w, win_y + win_h], radius=14, fill=(255, 255, 255), outline=C_BORDER_LIGHT, width=2)

    # Window Title Bar
    titlebar_h = 55
    draw.rounded_rectangle([win_x, win_y, win_x + win_w, win_y + titlebar_h], radius=14, fill=(240, 238, 234))
    draw.rectangle([win_x, win_y + titlebar_h - 10, win_x + win_w, win_y + titlebar_h], fill=(240, 238, 234))
    draw.line([(win_x, win_y + titlebar_h), (win_x + win_w, win_y + titlebar_h)], fill=C_BORDER_LIGHT, width=1)

    # Traffic lights (red, yellow, green)
    draw.ellipse([win_x + 25, win_y + 20, win_x + 41, win_y + 36], fill=(255, 95, 86))
    draw.ellipse([win_x + 50, win_y + 20, win_x + 66, win_y + 36], fill=(255, 189, 46))
    draw.ellipse([win_x + 75, win_y + 20, win_x + 91, win_y + 36], fill=(39, 201, 63))

    # Centered URL Bar
    url_w = 640
    url_x = win_x + (win_w - url_w) // 2
    draw.rounded_rectangle([url_x, win_y + 12, url_x + url_w, win_y + 44], radius=6, fill=(255, 255, 255), outline=C_BORDER_LIGHT, width=1)
    draw.text((url_x + 30, win_y + 19), "[SECURE SSL]  https://nosey-cat.vercel.app", font=get_font(FONT_MENLO, 14), fill=(60, 60, 60))

    # Browser Content
    # Navigation bar inside
    nav_y = win_y + titlebar_h + 20
    draw.text((win_x + 40, nav_y), "KEPO CAT // 16-BIT RETRO SOFTWARE", font=get_font(FONT_HELVETICA, 18), fill=C_TEXT_LIGHT)
    draw.text((win_x + win_w - 480, nav_y + 2), "ARCADE    MEME STUDIO    ROADMAP    ECOSYSTEM", font=get_font(FONT_MENLO, 12), fill=C_MUTED_LIGHT)

    # Hero Section Inside
    hero_y = nav_y + 60
    draw.rectangle([win_x + 40, hero_y, win_x + 200, hero_y + 24], fill=C_LIME)
    draw.text((win_x + 48, hero_y + 4), "01 // THE RESISTANCE", font=get_font(FONT_MENLO, 11), fill=(0, 0, 0))

    # Headline
    draw.text((win_x + 40, hero_y + 45), "Fed up with junk coins.", font=get_font(FONT_HELVETICA, 48), fill=C_TEXT_LIGHT)
    # Highlighted second line
    hl_w = font_title_lg.getbbox("Here to back real ones.")[2] - font_title_lg.getbbox("Here to back real ones.")[0]
    draw.rectangle([win_x + 36, hero_y + 105, win_x + 44 + hl_w, hero_y + 160], fill=C_LIME)
    draw.text((win_x + 40, hero_y + 108), "Here to back real ones.", font=get_font(FONT_HELVETICA, 48), fill=(0, 0, 0))

    # Body paragraphs
    p1 = "We build software, not just memes. That is why Kepo Cat is live on mainnet before the token launch."
    p2 = "1B supply, 0% tax, burned liquidity. The 16-bit resistance against 2-minute rug pulls on Solana."
    draw.text((win_x + 40, hero_y + 190), p1, font=font_body, fill=C_MUTED_LIGHT)
    draw.text((win_x + 40, hero_y + 225), p2, font=font_body, fill=C_MUTED_LIGHT)

    # Right side: Cat at workstation card
    station_path = "public/banners/nosey-degen-battle-station.png"
    if os.path.exists(station_path):
        st_img = Image.open(station_path).convert("RGBA")
        st_crop = st_img.resize((500, 280), Image.Resampling.LANCZOS)
        img.paste(st_crop, (win_x + win_w - 560, hero_y + 30))
        draw.rounded_rectangle([win_x + win_w - 560, hero_y + 30, win_x + win_w - 60, hero_y + 310], radius=8, outline=C_BORDER_LIGHT, width=2)

    # 3 Small Feature Cards at bottom of browser
    fcard_y = hero_y + 330
    fcards = [
        ("RETRO ARCADE BOOP", "Playable in browser, sound FX, high-score leaderboards."),
        ("COMMUNITY GENESIS", "50 Diamond Paws conviction vanguard assembled for stealth launch."),
        ("100% FAIR LIQUIDITY", "Permanent LP burn on Raydium. Contract renounced, 0% tax.")
    ]
    fc_w = 440
    for i, (f_title, f_desc) in enumerate(fcards):
        fx = win_x + 40 + i * (fc_w + 30)
        draw.rounded_rectangle([fx, fcard_y, fx + fc_w, fcard_y + 110], radius=6, fill=(248, 247, 244), outline=C_BORDER_LIGHT, width=1)
        draw.text((fx + 16, fcard_y + 16), f_title, font=get_font(FONT_HELVETICA, 16), fill=C_TEXT_LIGHT)
        draw.text((fx + 16, fcard_y + 48), f_desc, font=get_font(FONT_HELVETICA, 13), fill=C_MUTED_LIGHT)

    draw_bottom_caption(draw, "EVERYTHING IS ON THE SITE", "NOSEY-CAT.VERCEL.APP", is_dark=False)
    img.save(os.path.join(OUTPUT_DIR, "scene6_website.png"))
    print("Scene 6 rendered.")

# ==============================================================================
# SCENE 7: INSTITUTIONAL LAUNCHPAD OUTRO & INVESTOR CTA
# ==============================================================================
def render_scene7():
    img = Image.new("RGB", (W, H), C_DARK_BG)
    draw = ImageDraw.Draw(img)
    draw_hud_corners(draw, W, H, is_dark=True)
    draw_hud_header(draw, "// 07 // LAUNCH READINESS // MISSION CONTROL", "COUNTDOWN: 100% OPERATIONAL", is_dark=True)

    cx, cy = W // 2, 340

    # Mascot card frame
    m_size = 280
    draw.rounded_rectangle([cx - m_size // 2, cy - m_size // 2, cx + m_size // 2, cy + m_size // 2], radius=16, fill=C_CARD_DARK, outline=C_LIME, width=3)
    # Tag
    draw.rectangle([cx - 70, cy - m_size // 2 - 12, cx + 70, cy - m_size // 2 + 10], fill=C_LIME)
    draw.text((cx - 45, cy - m_size // 2 - 9), "STATUS: CHILL", font=get_font(FONT_MENLO, 11), fill=(0, 0, 0))

    # Mascot image
    cat_thumb = cat_master.crop((int(cat_master.width * 0.15), 0, int(cat_master.width * 0.85), int(cat_master.height * 0.75))).resize((230, 230), Image.Resampling.LANCZOS)
    img.paste(cat_thumb, (cx - 115, cy - 105), cat_thumb)

    # Large Institutional Typography
    draw.text((cx - font_title_lg.getbbox("KEPO CAT ($KEPO)")[2] // 2, cy + 180), "KEPO CAT ($KEPO)", font=font_title_lg, fill=C_TEXT_DARK)
    draw.text((cx - font_mono_lg.getbbox("STEALTH FAIR LAUNCH ON SOLANA // PUMP.FUN")[2] // 2, cy + 245), "STEALTH FAIR LAUNCH ON SOLANA // PUMP.FUN", font=font_mono_lg, fill=C_LIME)

    # Clean Link Bar
    draw_pill(draw, cx, cy + 320, "NOSEY-CAT.VERCEL.APP", font_pill, bg_color=C_LIME, text_color=(0, 0, 0), px=40, py=10)

    # Social Handles
    soc_text = "@TheNoseyCat on X   •   Telegram: t.me/TheNoseyCat"
    draw.text((cx - font_mono.getbbox(soc_text)[2] // 2, cy + 415), soc_text, font=font_mono, fill=C_MUTED_DARK)

    # Legal Disclaimer at bottom (Anti-Slop transparent disclosure)
    legal = "$KEPO IS A DECENTRALIZED 16-BIT MEME COIN ON SOLANA. 100% LIQUIDITY BURNED. ZERO TAX. DYOR."
    draw.text((cx - font_mono.getbbox(legal)[2] // 2, H - 45), legal, font=get_font(FONT_MENLO, 11), fill=(70, 85, 80))

    img.save(os.path.join(OUTPUT_DIR, "scene7_outro.png"))
    print("Scene 7 rendered.")

if __name__ == "__main__":
    render_scene1()
    render_scene2()
    render_scene3()
    render_scene4()
    render_scene5()
    render_scene6()
    render_scene7()
    print("All 7 Antislop Presentation Scenes Rendered Successfully!")
