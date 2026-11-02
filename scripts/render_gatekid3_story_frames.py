import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = "/tmp/story_frames"
os.makedirs(OUTPUT_DIR, exist_ok=True)

W, H = 1080, 1920
FPS = 30
TOTAL_FRAMES = 780  # 26.0 seconds

# Colors
C_BG_DARK = (10, 14, 22)
C_NEON_GREEN = (0, 255, 102)
C_NEON_PINK = (255, 80, 180)
C_SOLANA_PURPLE = (153, 69, 255)
C_SOLANA_CYAN = (20, 241, 149)
C_GOLD = (255, 215, 0)
C_WHITE = (255, 255, 255)
C_BLACK = (0, 0, 0)
C_BOX_BG = (12, 16, 26)
C_BOX_BORDER = (40, 55, 75)

# Fonts
FONT_RETRO_PATH = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/scratch/PressStart2P.ttf"
FONT_MENLO_PATH = "/System/Library/Fonts/Menlo.ttc"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

font_pixel_title = get_font(FONT_RETRO_PATH, 24)
font_pixel_dialogue = get_font(FONT_RETRO_PATH, 20)
font_pixel_dialogue_sm = get_font(FONT_RETRO_PATH, 16)
font_pixel_name = get_font(FONT_RETRO_PATH, 16)
font_pixel_tag = get_font(FONT_RETRO_PATH, 14)
font_pixel_badge = get_font(FONT_RETRO_PATH, 18)

# Load Source Assets
cat_path = "/tmp/cat_isolated.png"
if not os.path.exists(cat_path):
    cat_path = "public/mascot-pixel.png"
cat_master = Image.open(cat_path).convert("RGBA")

bg_station_path = "public/banners/nosey-degen-battle-station-1080p.png"
bg_moon_path = "public/banners/nosey-moon-mission-1080p.png"
bg_genesis_path = "public/banners/kepo-cat-landscape-genesis.jpg"

bg_station = Image.open(bg_station_path).convert("RGBA") if os.path.exists(bg_station_path) else None
bg_moon = Image.open(bg_moon_path).convert("RGBA") if os.path.exists(bg_moon_path) else None
bg_genesis = Image.open(bg_genesis_path).convert("RGBA") if os.path.exists(bg_genesis_path) else None

def crop_fit_stage(bg_img, stage_h=1340):
    """Crops and fits landscape image to vertical stage area (1080 x stage_h)"""
    if bg_img is None:
        return Image.new("RGBA", (W, stage_h), C_BG_DARK)
    bw, bh = bg_img.size
    scale = max(W / bw, stage_h / bh)
    nw, nh = int(bw * scale), int(bh * scale)
    resized = bg_img.resize((nw, nh), Image.Resampling.LANCZOS)
    cx, cy = (nw - W) // 2, (nh - stage_h) // 2
    return resized.crop((cx, cy, cx + W, cy + stage_h))

stage_station = crop_fit_stage(bg_station)
stage_moon = crop_fit_stage(bg_moon)
stage_genesis = crop_fit_stage(bg_genesis)

def draw_retro_rpg_box(draw, text_line1, text_line2, portrait_type="normal", progress=1.0):
    """Draws authentic Undertale / Gatekid3 retro RPG dialogue box at the bottom."""
    box_x = 40
    box_y = 1360
    box_w = W - 80
    box_h = 500
    
    # Outer dark shadow
    draw.rectangle([box_x + 8, box_y + 8, box_x + box_w + 8, box_y + box_h + 8], fill=(0, 0, 0, 200))
    # Box Background
    draw.rectangle([box_x, box_y, box_x + box_w, box_y + box_h], fill=C_BOX_BG)
    
    # Double Pixel Border
    draw.rectangle([box_x, box_y, box_x + box_w, box_y + box_h], outline=C_GOLD, width=4)
    draw.rectangle([box_x + 8, box_y + 8, box_x + box_w - 8, box_y + box_h - 8], outline=C_NEON_GREEN, width=3)
    
    # Name Header Tag
    draw.rectangle([box_x + 30, box_y - 20, box_x + 480, box_y + 22], fill=C_GOLD)
    draw.text((box_x + 45, box_y - 12), "★ KEPO CAT [SNOOT LORE]", font=font_pixel_name, fill=C_BLACK)
    
    # Portrait Frame on Left
    port_x = box_x + 30
    port_y = box_y + 45
    port_size = 180
    draw.rectangle([port_x, port_y, port_x + port_size, port_y + port_size], fill=(5, 8, 14), outline=C_NEON_GREEN, width=3)
    
    # Draw Animated Cat Face in Portrait
    head_crop = cat_master.crop((cat_master.width // 4, 80, cat_master.width * 3 // 4, 520))
    head_resized = head_crop.resize((port_size - 16, port_size - 16), Image.Resampling.LANCZOS)
    
    # Talking mouth animation
    is_mouth_open = (int(progress * 40) % 2 == 1) if progress < 1.0 else False
    if is_mouth_open:
        # Subtle squash on talking
        pass
        
    p_img = Image.new("RGBA", (port_size - 16, port_size - 16), (0, 0, 0, 0))
    p_img.paste(head_resized, (0, 0), head_resized)
    p_draw = ImageDraw.Draw(p_img)
    
    if portrait_type == "laser":
        # Laser eyes in portrait
        p_draw.ellipse([60, 60, 74, 74], fill=C_NEON_GREEN)
        p_draw.ellipse([100, 60, 114, 74], fill=C_NEON_GREEN)
    elif portrait_type == "shades":
        # Pixel sunglasses
        p_draw.rectangle([50, 58, 80, 76], fill=C_BLACK, outline=C_GOLD, width=2)
        p_draw.rectangle([94, 58, 124, 76], fill=C_BLACK, outline=C_GOLD, width=2)
        p_draw.line([(80, 66), (94, 66)], fill=C_GOLD, width=2)
        
    # Paste portrait
    # Will be pasted on master canvas in caller
    
    # Dialogue Text with Typewriter Effect
    full_text = text_line1 + "\n" + text_line2
    total_chars = len(full_text)
    visible_chars = int(total_chars * min(1.0, progress * 1.3))
    
    # Split into lines
    line1_len = len(text_line1)
    v_line1 = text_line1[:min(line1_len, visible_chars)]
    v_line2 = text_line2[:max(0, visible_chars - line1_len - 1)] if visible_chars > line1_len else ""
    
    text_x = port_x + port_size + 35
    text_y = port_y + 15
    draw.text((text_x, text_y), v_line1, font=font_pixel_dialogue, fill=C_WHITE)
    draw.text((text_x, text_y + 60), v_line2, font=font_pixel_dialogue, fill=C_NEON_GREEN)
    
    # Blinking prompt arrow at bottom right when done
    if progress >= 0.9 and (int(progress * 10) % 2 == 0):
        draw.polygon([
            (box_x + box_w - 50, box_y + box_h - 45),
            (box_x + box_w - 30, box_y + box_h - 45),
            (box_x + box_w - 40, box_y + box_h - 30)
        ], fill=C_GOLD)
        
    return p_img, (port_x + 8, port_y + 8)

# Pre-render 5 Acts
print("Rendering Gatekid3 Story Animation Frames (780 frames, 30fps)...")

for frame_idx in range(TOTAL_FRAMES):
    time_sec = frame_idx / FPS
    canvas = Image.new("RGBA", (W, H), C_BG_DARK)
    draw = ImageDraw.Draw(canvas)
    
    # -------------------------------------------------------------------------
    # ACT 1: THE SNOOT SNIFF (0.0s - 5.2s, frames 0-155)
    # -------------------------------------------------------------------------
    if frame_idx < 156:
        act_f = frame_idx
        act_prog = act_f / 156.0
        
        # Background: Retro battle station with subtle CRT pulse
        canvas.paste(stage_station, (0, 0))
        
        # Kepo Cat sitting at desk with breathing & curious head tilt
        bounce = math.sin(time_sec * 5.0) * 8.0
        tilt_angle = -20.0 * min(1.0, max(0.0, (act_prog - 0.25) * 3.0))
        
        cat_w, cat_h = 580, 580
        cat_cur = cat_master.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
        if tilt_angle != 0:
            cat_cur = cat_cur.rotate(tilt_angle, resample=Image.Resampling.BICUBIC, expand=True)
            
        cat_x = W // 2 - cat_cur.width // 2
        cat_y = int(680 + bounce)
        canvas.paste(cat_cur, (cat_x, cat_y), cat_cur)
        
        # Exclamation Mark & Laser Eyes (after t = 2.0s)
        if act_prog > 0.4:
            # Exclamation Mark
            excl_bounce = math.sin(time_sec * 12.0) * 6.0
            draw.rectangle([W//2 + 80, int(520 + excl_bounce), W//2 + 105, int(580 + excl_bounce)], fill=C_GOLD, outline=C_BLACK, width=2)
            draw.rectangle([W//2 + 80, int(595 + excl_bounce), W//2 + 105, int(620 + excl_bounce)], fill=C_GOLD, outline=C_BLACK, width=2)
            
            # Laser Eye Beams
            laser_w = int(min(W, (act_prog - 0.4) * 2000))
            draw.line([(cat_x + cat_cur.width//2 - 40, cat_y + 190), (0, 300)], fill=C_NEON_GREEN, width=6)
            draw.line([(cat_x + cat_cur.width//2 + 40, cat_y + 190), (W, 300)], fill=C_NEON_GREEN, width=6)
            
            # Floating Pump Numbers
            draw.text((120, int(450 - act_prog * 120)), "+420% PUMP", font=font_pixel_badge, fill=C_NEON_GREEN)
            draw.text((W - 380, int(480 - act_prog * 100)), "+1337x MOON", font=font_pixel_badge, fill=C_SOLANA_CYAN)

        # Dialogue
        l1 = "Normal cats look away..."
        l2 = "Me? I sniff green candles before Raydium even notices!"
        port_type = "laser" if act_prog > 0.45 else "normal"
        p_img, p_pos = draw_retro_rpg_box(draw, l1, l2, port_type, act_prog)
        canvas.paste(p_img, p_pos, p_img)

    # -------------------------------------------------------------------------
    # ACT 2: THE PROOF-OF-BOOP (5.2s - 10.4s, frames 156-311)
    # -------------------------------------------------------------------------
    elif frame_idx < 312:
        act_f = frame_idx - 156
        act_prog = act_f / 156.0
        
        # Background: Cyber arcade grid
        canvas.paste(stage_station, (0, 0))
        # Dim stage slightly for spotlight
        dim = Image.new("RGBA", (W, 1340), (0, 0, 0, 140))
        canvas.paste(dim, (0, 0), dim)
        
        # Giant Close-up Cat Head
        cat_w, cat_h = 850, 850
        cat_cur = cat_master.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
        
        # Squash on boop (at act_prog = 0.4 to 0.6)
        boop_active = (0.38 < act_prog < 0.6)
        if boop_active:
            cat_cur = cat_cur.resize((cat_w + 30, cat_h - 30), Image.Resampling.LANCZOS)
            
        cat_x = W // 2 - cat_cur.width // 2
        cat_y = 350
        canvas.paste(cat_cur, (cat_x, cat_y), cat_cur)
        
        # Glowing Pink Nose Reticle
        nose_cx = W // 2 + 10
        nose_cy = 670
        
        # Animated Pixel Hand Cursor sliding in and clicking
        if act_prog < 0.42:
            hand_t = act_prog / 0.42
            hx = int(W + 50 - hand_t * (W - nose_cx + 100))
            hy = int(1100 - hand_t * (1100 - nose_cy))
            # Draw simple pixel glove hand
            draw.rectangle([hx, hy, hx + 50, hy + 70], fill=C_WHITE, outline=C_BLACK, width=3)
            draw.rectangle([hx - 25, hy - 30, hx, hy + 20], fill=C_WHITE, outline=C_BLACK, width=3) # Pointing finger
            draw.text((hx - 80, hy - 50), "CLICK!", font=font_pixel_tag, fill=C_NEON_PINK)
        else:
            # Concentric Pink Shockwaves expanding!
            rip_t = (act_prog - 0.42) * 5.0
            for r in [40, 90, 160, 240, 340]:
                cur_r = int(r * rip_t)
                if cur_r < 450:
                    alpha = max(0, 255 - int(cur_r * 0.5))
                    draw.ellipse([nose_cx - cur_r, nose_cy - cur_r, nose_cx + cur_r, nose_cy + cur_r], outline=(255, 80, 180, alpha), width=5)
            
            # Massive Floating "BOOP! +1000 POB" Banner
            badge_y = int(320 - math.sin((act_prog - 0.42) * 10.0) * 15.0)
            draw.rounded_rectangle([W//2 - 280, badge_y, W//2 + 280, badge_y + 80], radius=15, fill=C_NEON_PINK, outline=C_WHITE, width=4)
            draw.text((W//2 - 240, badge_y + 22), "🐾 * BOOP! +1000 POB *", font=font_pixel_badge, fill=C_WHITE)
            
            # Rising Pixel Hearts
            for h_i in range(8):
                ph_x = nose_cx + int(math.sin(h_i * 1.5 + act_f) * 180)
                ph_y = nose_cy - int((act_prog - 0.42) * 600 + h_i * 35)
                if 200 < ph_y < 1200:
                    draw.text((ph_x, ph_y), "♥", font=font_pixel_title, fill=C_NEON_PINK)

        # Dialogue
        l1 = "Proof-of-Boop (PoB) activated!"
        l2 = "It's a crime to visit without booping my pink snoot!"
        port_type = "normal"
        p_img, p_pos = draw_retro_rpg_box(draw, l1, l2, port_type, act_prog)
        canvas.paste(p_img, p_pos, p_img)

    # -------------------------------------------------------------------------
    # ACT 3: THE SOLANA FURNACE & 1B SUPPLY (10.4s - 15.6s, frames 312-467)
    # -------------------------------------------------------------------------
    elif frame_idx < 468:
        act_f = frame_idx - 312
        act_prog = act_f / 156.0
        
        # Background: Cyberpunk stone forge with pixel fire
        canvas.paste(stage_genesis, (0, 0))
        
        # 16-bit Furnace Flames at bottom of stage
        for fl_i in range(15):
            fl_x = 80 + fl_i * 65
            fl_h = int(120 + math.sin(fl_i + act_f * 0.4) * 45)
            draw.polygon([
                (fl_x, 1300),
                (fl_x + 35, 1300 - fl_h),
                (fl_x + 70, 1300)
            ], fill=(255, 80, 20) if fl_i % 2 == 0 else C_GOLD)

        # 3 Giant Badges Slamming Down with Bounce
        badges = [
            ("💎 1,000,000,000 FIXED SUPPLY", C_NEON_GREEN, 0.1),
            ("🚫 0% BUY & 0% SELL TAX", C_SOLANA_CYAN, 0.35),
            ("🔥 100% LP BURNED IN FURNACE", C_GOLD, 0.6)
        ]
        
        by = 240
        for title, col, trig_t in badges:
            if act_prog >= trig_t:
                b_anim = min(1.0, (act_prog - trig_t) * 4.0)
                b_offset = (1.0 - b_anim) * -400
                draw.rounded_rectangle([60, int(by + b_offset), W - 60, int(by + b_offset + 120)], radius=12, fill=C_BOX_BG, outline=col, width=4)
                draw.rectangle([60, int(by + b_offset), 85, int(by + b_offset + 120)], fill=col)
                draw.text((110, int(by + b_offset + 42)), title, font=font_pixel_badge, fill=col)
            by += 160
            
        # Cat standing on right side throwing golden key
        cat_w, cat_h = 440, 440
        cat_cur = cat_master.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
        canvas.paste(cat_cur, (W - 460, 840), cat_cur)
        
        # Golden LP Key flying into fire
        if act_prog < 0.6:
            key_t = act_prog / 0.6
            kx = int(W - 350 - key_t * 300)
            ky = int(880 + math.sin(key_t * math.pi) * -120 + key_t * 260)
            draw.rectangle([kx, ky, kx + 45, ky + 25], fill=C_GOLD, outline=C_BLACK, width=2)
            draw.text((kx - 50, ky - 30), "LP KEYS", font=font_pixel_tag, fill=C_GOLD)

        # Dialogue
        l1 = "Zero developer tax. No insider dumping."
        l2 = "1B supply. 100% LP burned forever in the furnace!"
        port_type = "normal"
        p_img, p_pos = draw_retro_rpg_box(draw, l1, l2, port_type, act_prog)
        canvas.paste(p_img, p_pos, p_img)

    # -------------------------------------------------------------------------
    # ACT 4: THE MOON MISSION BLAST-OFF (15.6s - 20.8s, frames 468-623)
    # -------------------------------------------------------------------------
    elif frame_idx < 624:
        act_f = frame_idx - 468
        act_prog = act_f / 156.0
        
        # Background: Night sky launchpad & 16-bit Moon
        canvas.paste(stage_moon, (0, 0))
        
        # Green Candlestick Rocket launching diagonally
        rocket_t = max(0.0, (act_prog - 0.25) / 0.75)
        rx = int(W // 2 - 120 + rocket_t * 300)
        ry = int(880 - rocket_t * 800)
        
        # Rocket Body
        draw.rectangle([rx, ry, rx + 140, ry + 280], fill=C_NEON_GREEN, outline=C_WHITE, width=4)
        draw.polygon([(rx, ry), (rx + 70, ry - 80), (rx + 140, ry)], fill=C_NEON_GREEN, outline=C_WHITE)
        draw.text((rx + 20, ry + 120), "KEPO", font=font_pixel_badge, fill=C_BLACK)
        
        # Rocket Exhaust Fire
        if rocket_t > 0:
            fl_h = int(140 + math.sin(act_f * 0.8) * 40)
            draw.polygon([
                (rx + 20, ry + 280),
                (rx + 70, ry + 280 + fl_h),
                (rx + 120, ry + 280)
            ], fill=C_GOLD)
            # Particle smoke
            for s_i in range(6):
                sm_x = rx + 70 + int(math.sin(s_i * 2.0 + act_f) * 40)
                sm_y = ry + 280 + fl_h + s_i * 25
                draw.rectangle([sm_x, sm_y, sm_x + 16, sm_y + 16], fill=(200, 200, 200, 160))
                
        # Cat Mascot Riding on Rocket with Thug Life Sunglasses
        cat_w, cat_h = 320, 320
        cat_cur = cat_master.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
        canvas.paste(cat_cur, (rx - 60, ry - 60), cat_cur)
        
        # Sunglasses on cat
        draw.rectangle([rx + 45, ry + 10, rx + 80, ry + 30], fill=C_BLACK, outline=C_GOLD, width=2)
        draw.rectangle([rx + 95, ry + 10, rx + 130, ry + 30], fill=C_BLACK, outline=C_GOLD, width=2)
        draw.line([(rx + 80, ry + 20), (rx + 95, ry + 20)], fill=C_GOLD, width=2)

        # Dialogue
        l1 = "Stage 1 Genesis: 50 Diamond Paws."
        l2 = "Diamond paws hold the line. Next stop: THE MOON!"
        port_type = "shades"
        p_img, p_pos = draw_retro_rpg_box(draw, l1, l2, port_type, act_prog)
        canvas.paste(p_img, p_pos, p_img)

    # -------------------------------------------------------------------------
    # ACT 5: GRAND OUTRO & CALL TO ACTION (20.8s - 26.0s, frames 624-779)
    # -------------------------------------------------------------------------
    else:
        act_f = frame_idx - 624
        act_prog = act_f / 156.0
        
        # Background: Giant glowing moon surface
        canvas.paste(stage_moon, (0, 0))
        
        # Giant Moon Banner & Cat Chilling on Moon
        cat_w, cat_h = 420, 420
        cat_cur = cat_master.resize((cat_w, cat_h), Image.Resampling.LANCZOS)
        canvas.paste(cat_cur, (W // 2 - cat_w // 2, 280), cat_cur)
        
        # Sunglasses on cat
        cx = W // 2 - cat_w // 2
        draw.rectangle([cx + 145, 365, cx + 195, 395], fill=C_BLACK, outline=C_GOLD, width=3)
        draw.rectangle([cx + 225, 365, cx + 275, 395], fill=C_BLACK, outline=C_GOLD, width=3)
        draw.line([(cx + 195, 380), (cx + 225, 380)], fill=C_GOLD, width=3)
        
        # 3 Official Portal Cards
        portals = [
            ("🌐 WEBSITE:", "nosey-cat.vercel.app", C_NEON_GREEN),
            ("💬 TELEGRAM:", "t.me/TheNoseyCat", C_SOLANA_CYAN),
            ("🐦 X (TWITTER):", "@TheNoseyCat", C_GOLD)
        ]
        
        py = 740
        for label, val, col in portals:
            draw.rounded_rectangle([80, py, W - 80, py + 95], radius=10, fill=C_BOX_BG, outline=col, width=3)
            draw.text((110, py + 32), label, font=font_pixel_name, fill=col)
            draw.text((420, py + 32), val, font=font_pixel_name, fill=C_WHITE)
            py += 120
            
        # Big Pulsing Button
        pulse = math.sin(act_f * 0.3) * 6.0
        btn_y = 1140
        draw.rounded_rectangle([80 - int(pulse), btn_y, W - 80 + int(pulse), btn_y + 110], radius=16, fill=C_NEON_GREEN, outline=C_WHITE, width=4)
        draw.text((150, btn_y + 40), "🕹️ BOOP TO JOIN DIAMOND PAWS", font=font_pixel_badge, fill=C_BLACK)

        # Dialogue
        l1 = "Curiosity sent this cat to the moon!"
        l2 = "Boop the snoot at nosey-cat.vercel.app!"
        port_type = "shades"
        p_img, p_pos = draw_retro_rpg_box(draw, l1, l2, port_type, act_prog)
        canvas.paste(p_img, p_pos, p_img)

    # Save Frame
    frame_path = os.path.join(OUTPUT_DIR, f"frame_{frame_idx:04d}.png")
    canvas.save(frame_path, "PNG")
    
    if frame_idx % 120 == 0:
        pct = int((frame_idx / TOTAL_FRAMES) * 100)
        print(f"Rendered {frame_idx}/{TOTAL_FRAMES} frames ({pct}%)...")

print("All 780 Story Animation Frames Rendered Successfully!")
