import Foundation
import AVFoundation
import CoreGraphics
import CoreText
import AppKit

let tempVideoPath = "/tmp/temp_kepo_master.mp4"
let finalVideoPath = "public/videos/kepo-story-animation.mp4"
let downloadsVideoPath = "/Users/syamhariabidin/Downloads/kepo-story-animation.mp4"
let artifactVideoPath = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/kepo-story-animation.mp4"

let refMusicPath = "/tmp/ref_audio.m4a"
let sfxPath = "/tmp/story_sfx_v2.m4a"

try? FileManager.default.removeItem(atPath: tempVideoPath)
try? FileManager.default.removeItem(atPath: finalVideoPath)

let width = 1080
let height = 1920
let fps: Int32 = 30
let totalFrames = 780 // 26.0 seconds
let durationSec = 26.0

// Register PressStart2P Font
let fontPath = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/scratch/PressStart2P.ttf"
let fontUrl = URL(fileURLWithPath: fontPath) as CFURL
CTFontManagerRegisterFontsForURL(fontUrl, .process, nil)

let fontPixel20 = NSFont(name: "PressStart2P-Regular", size: 20) ?? NSFont.monospacedSystemFont(ofSize: 20, weight: .bold)
let fontPixel16 = NSFont(name: "PressStart2P-Regular", size: 16) ?? NSFont.monospacedSystemFont(ofSize: 16, weight: .bold)
let fontPixel14 = NSFont(name: "PressStart2P-Regular", size: 14) ?? NSFont.monospacedSystemFont(ofSize: 14, weight: .bold)
let fontPixel12 = NSFont(name: "PressStart2P-Regular", size: 12) ?? NSFont.monospacedSystemFont(ofSize: 12, weight: .bold)

// Initialize AVAssetWriter
let tempUrl = URL(fileURLWithPath: tempVideoPath)
guard let writer = try? AVAssetWriter(outputURL: tempUrl, fileType: .mp4) else {
    print("Error: Could not create AVAssetWriter")
    exit(1)
}

let videoSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 10_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]

let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
writerInput.expectsMediaDataInRealTime = false

let sourceBufferAttributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32ARGB),
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
]

let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: writerInput,
    sourcePixelBufferAttributes: sourceBufferAttributes
)

guard writer.canAdd(writerInput) else {
    print("Error: Cannot add writer input")
    exit(1)
}
writer.add(writerInput)

writer.startWriting()
writer.startSession(atSourceTime: .zero)

// Load Master Artwork (photo_2026-11-02 09.55.04)
guard let masterNsImg = NSImage(contentsOfFile: "public/banners/kepo-cyberpunk-alley-master.jpg"),
      let masterCG = masterNsImg.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Error: Could not load master artwork")
    exit(1)
}

let mw = CGFloat(masterCG.width)   // 1024
let mh = CGFloat(masterCG.height)  // 571

// Crop Cat Head for Dialogue Box Portrait
let catHeadRect = CGRect(x: 430, y: mh - 390, width: 120, height: 120)
let catHeadCG = masterCG.cropping(to: catHeadRect) ?? masterCG

// Helper: Draw Text with NSAttributedString in CoreGraphics
func drawText(
    ctx: CGContext,
    text: String,
    x: CGFloat,
    y: CGFloat,
    font: NSFont,
    color: NSColor
) {
    let attrs: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color
    ]
    let str = NSAttributedString(string: text, attributes: attrs)
    let line = CTLineCreateWithAttributedString(str)
    
    ctx.saveGState()
    ctx.textPosition = CGPoint(x: x, y: CGFloat(height) - y - font.pointSize)
    CTLineDraw(line, ctx)
    ctx.restoreGState()
}

func lerp(a: CGFloat, b: CGFloat, t: CGFloat) -> CGFloat {
    return a + (b - a) * t
}

func smoothstep(t: CGFloat) -> CGFloat {
    let clamped = max(0.0, min(1.0, t))
    return clamped * clamped * (3.0 - 2.0 * clamped)
}

func drawRPGBox(
    ctx: CGContext,
    line1: String,
    line2: String,
    progress: Double,
    frame: Int
) {
    let boxX: CGFloat = 40
    let boxY: CGFloat = 1420
    let boxW: CGFloat = CGFloat(width) - 80
    let boxH: CGFloat = 450
    let cgY = CGFloat(height) - boxY - boxH
    
    ctx.saveGState()
    
    // Drop shadow
    ctx.setFillColor(CGColor(red: 0.05, green: 0.03, blue: 0.08, alpha: 0.75))
    ctx.fill(CGRect(x: boxX + 6, y: cgY - 6, width: boxW, height: boxH))
    
    // Box fill: Sampled alley shadow
    ctx.setFillColor(CGColor(red: 0.09, green: 0.07, blue: 0.15, alpha: 0.94))
    ctx.fill(CGRect(x: boxX, y: cgY, width: boxW, height: boxH))
    
    // Double Border: Soft Solana Cyan + Neon Magenta
    ctx.setLineWidth(3.5)
    ctx.setStrokeColor(CGColor(red: 0.18, green: 0.83, blue: 0.75, alpha: 0.9)) // Soft Cyan
    ctx.stroke(CGRect(x: boxX, y: cgY, width: boxW, height: boxH))
    
    ctx.setLineWidth(2.0)
    ctx.setStrokeColor(CGColor(red: 0.85, green: 0.27, blue: 0.93, alpha: 0.8)) // Soft Magenta
    ctx.stroke(CGRect(x: boxX + 6, y: cgY + 6, width: boxW - 12, height: boxH - 12))
    
    // Header Tag: Warm Amber
    let tagW: CGFloat = 480
    let tagH: CGFloat = 36
    let tagY = cgY + boxH - 18
    ctx.setFillColor(CGColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 1.0)) // Warm Amber
    ctx.fill(CGRect(x: boxX + 25, y: tagY, width: tagW, height: tagH))
    
    // Portrait Box
    let portSize: CGFloat = 170
    let portX = boxX + 25
    let portY = cgY + boxH - portSize - 55
    ctx.setFillColor(CGColor(red: 0.06, green: 0.04, blue: 0.10, alpha: 1.0))
    ctx.fill(CGRect(x: portX, y: portY, width: portSize, height: portSize))
    ctx.setLineWidth(2.5)
    ctx.setStrokeColor(CGColor(red: 0.18, green: 0.83, blue: 0.75, alpha: 0.9))
    ctx.stroke(CGRect(x: portX, y: portY, width: portSize, height: portSize))
    
    // Draw Cat Head
    let headRect = CGRect(x: portX + 6, y: portY + 6, width: portSize - 12, height: portSize - 12)
    ctx.draw(catHeadCG, in: headRect)
    
    // Eye Blink every 80 frames (frames 76-80)
    if frame % 80 > 75 {
        ctx.setFillColor(CGColor(red: 0.08, green: 0.08, blue: 0.14, alpha: 1.0))
        ctx.fill(CGRect(x: portX + 55, y: portY + 95, width: 22, height: 6))
        ctx.fill(CGRect(x: portX + 95, y: portY + 95, width: 22, height: 6))
    }
    
    ctx.restoreGState()
    
    // Name Tag Text
    drawText(ctx: ctx, text: "★ KEPO CAT [SNOOT OF SOLANA]", x: boxX + 38, y: boxY - 9, font: fontPixel14, color: .black)
    
    // Typewriter Text Reveal
    let fullChars = line1.count + line2.count
    let visibleTotal = Int(Double(fullChars) * min(1.0, progress * 1.35))
    
    let vLine1 = String(line1.prefix(visibleTotal))
    var vLine2 = ""
    if visibleTotal > line1.count {
        vLine2 = String(line2.prefix(visibleTotal - line1.count))
    }
    
    let textX = boxX + portSize + 40
    let cWhite = NSColor(red: 0.97, green: 0.98, blue: 0.99, alpha: 1.0)
    let cMint = NSColor(red: 0.29, green: 0.87, blue: 0.50, alpha: 1.0) // Soft Mint Green
    
    drawText(ctx: ctx, text: vLine1, x: textX, y: boxY + 65, font: fontPixel16, color: cWhite)
    drawText(ctx: ctx, text: vLine2, x: textX, y: boxY + 125, font: fontPixel16, color: cMint)
    
    // Blinking prompt arrow
    if progress >= 0.85 && (frame % 20 < 10) {
        ctx.saveGState()
        ctx.setFillColor(CGColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 1.0))
        let triX = boxX + boxW - 40
        let triY = cgY + 25
        let path = CGMutablePath()
        path.move(to: CGPoint(x: triX, y: triY + 15))
        path.addLine(to: CGPoint(x: triX + 18, y: triY + 15))
        path.addLine(to: CGPoint(x: triX + 9, y: triY))
        path.closeSubpath()
        ctx.addPath(path)
        ctx.fillPath()
        ctx.restoreGState()
    }
}

func renderMasterFrame(f: Int) -> CVPixelBuffer? {
    var pxBuffer: CVPixelBuffer?
    let status = CVPixelBufferCreate(
        kCFAllocatorDefault,
        width,
        height,
        kCVPixelFormatType_32ARGB,
        sourceBufferAttributes as CFDictionary,
        &pxBuffer
    )
    guard status == kCVReturnSuccess, let buffer = pxBuffer else { return nil }

    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    guard let pxData = CVPixelBufferGetBaseAddress(buffer) else { return nil }
    let rgbSpace = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
        data: pxData,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: rgbSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    ) else {
        return nil
    }

    let timeSec = Double(f) / Double(fps)
    
    // 1. Calculate Cinematic Camera Viewport (camX, camY, camW, camH) in master image (1024x571)
    var camX: CGFloat = 380
    var camY: CGFloat = 0
    var camW: CGFloat = 321
    var camH: CGFloat = 571
    
    var l1 = ""
    var l2 = ""
    var actProgress = 0.0

    // -------------------------------------------------------------
    // ACT 1: SOLANA ALLEY AT NIGHT (f: 0 .. 165, 0.0s - 5.5s)
    // -------------------------------------------------------------
    if f < 165 {
        actProgress = Double(f) / 165.0
        let t = smoothstep(t: CGFloat(actProgress))
        
        // Glide from upper alley (signs) down to cat
        camX = lerp(a: 280, b: 400, t: t)
        camY = 0
        camW = 321
        camH = 571
        
        l1 = "Di lorong sunyi Solana..."
        l2 = "Kepo Cat duduk memantau chart 24/7."
    }
    // -------------------------------------------------------------
    // ACT 2: GREEN CANDLE SNIFF & CRT MONITOR (f: 165 .. 330, 5.5s - 11.0s)
    // -------------------------------------------------------------
    else if f < 330 {
        actProgress = Double(f - 165) / 165.0
        let t = smoothstep(t: CGFloat(actProgress))
        
        // Pan smoothly to CRT monitor
        camX = lerp(a: 400, b: 640, t: t)
        camY = 0
        camW = 321
        camH = 571
        
        l1 = "Normal cats look away. Kepo Cat?"
        l2 = "Hidung pink-nya mendeteksi pump candle!"
    }
    // -------------------------------------------------------------
    // ACT 3: PROOF-OF-BOOP ZOOM (f: 330 .. 495, 11.0s - 16.5s)
    // -------------------------------------------------------------
    else if f < 495 {
        actProgress = Double(f - 330) / 165.0
        let t = smoothstep(t: CGFloat(actProgress))
        
        // Zoom-in closely on Kepo's face & pink snoot
        camX = lerp(a: 640, b: 410, t: t)
        camY = lerp(a: 0, b: 140, t: t)
        camW = lerp(a: 321, b: 240, t: t)
        camH = lerp(a: 571, b: 426, t: t)
        
        l1 = "*BOOP!* Proof-of-Boop aktif!"
        l2 = "Sentuh hidung pink ini demi restu green candle!"
    }
    // -------------------------------------------------------------
    // ACT 4: BULLETPROOF TOKENOMICS (f: 495 .. 645, 16.5s - 21.5s)
    // -------------------------------------------------------------
    else if f < 645 {
        actProgress = Double(f - 495) / 150.0
        let t = smoothstep(t: CGFloat(actProgress))
        
        // Pull back revealing full scene
        camX = lerp(a: 410, b: 450, t: t)
        camY = lerp(a: 140, b: 0, t: t)
        camW = lerp(a: 240, b: 321, t: t)
        camH = lerp(a: 426, b: 571, t: t)
        
        l1 = "1 Miliar Supply. 0% Pajak."
        l2 = "Likuiditas 100% dibakar selamanya di Solana!"
    }
    // -------------------------------------------------------------
    // ACT 5: GRAND OUTRO & PORTALS (f: 645 .. 780, 21.5s - 26.0s)
    // -------------------------------------------------------------
    else {
        actProgress = Double(f - 645) / 135.0
        camX = 420
        camY = 0
        camW = 321
        camH = 571
        
        l1 = "Curiosity sent this cat to the moon!"
        l2 = "Boop sekarang di nosey-cat.vercel.app!"
    }

    // 2. Crop master artwork with camera coordinates
    // CoreGraphics Y is from bottom
    let cgCamY = mh - camY - camH
    let cropRect = CGRect(x: camX, y: cgCamY, width: camW, height: camH)
    
    if let croppedScene = masterCG.cropping(to: cropRect) {
        ctx.draw(croppedScene, in: CGRect(x: 0, y: 0, width: width, height: height))
    }

    // 3. Dynamic Visual Overlays Matching Scene & Color
    
    // A. Soft Breathing Pink Snoot Glow
    let snootGlow = 0.45 + 0.35 * sin(timeSec * 4.0)
    ctx.saveGState()
    ctx.setBlendMode(.screen)
    // Pink halo around cat nose (relative to screen)
    if f >= 330 && f < 495 {
        // Close up nose
        ctx.setFillColor(CGColor(red: 0.95, green: 0.35, blue: 0.75, alpha: CGFloat(snootGlow * 0.55)))
        ctx.fillEllipse(in: CGRect(x: CGFloat(width)/2 - 50, y: CGFloat(height)/2 - 30, width: 100, height: 100))
    }
    ctx.restoreGState()

    // B. Act 2: Green Candlestick Rocket Pump on CRT Monitor
    if f >= 165 && f < 330 {
        ctx.saveGState()
        // Draw pumping green bars on CRT screen area
        let pumpH = min(220.0, Double(f - 165) * 2.5)
        ctx.setFillColor(CGColor(red: 0.29, green: 0.87, blue: 0.50, alpha: 0.85)) // Soft CRT Green
        ctx.fill(CGRect(x: CGFloat(width)/2 - 60, y: CGFloat(height)/2 + 20, width: 35, height: CGFloat(pumpH)))
        
        // Scanline sweep
        let scanY = (f * 12) % 300
        ctx.setFillColor(CGColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 0.25))
        ctx.fill(CGRect(x: CGFloat(width)/2 - 150, y: CGFloat(height)/2 - 100 + CGFloat(scanY), width: 300, height: 4))
        ctx.restoreGState()
        
        drawText(ctx: ctx, text: "SOL: 133.70 SOL (+420%)", x: CGFloat(width)/2 - 160, y: 380, font: fontPixel16, color: NSColor(red: 0.29, green: 0.87, blue: 0.50, alpha: 1.0))
    }

    // C. Act 3: Hand Cursor Boop & Star Sparkles
    if f >= 330 && f < 495 {
        let bProg = Double(f - 330) / 165.0
        if bProg < 0.45 {
            // Hand slides in
            let handT = CGFloat(bProg / 0.45)
            let hx = CGFloat(width) + 60.0 - handT * (CGFloat(width)/2 + 100.0)
            let hy = CGFloat(height)/2 + 140.0 - handT * 120.0
            
            ctx.saveGState()
            ctx.setFillColor(CGColor(red: 0.98, green: 0.98, blue: 1.0, alpha: 1.0))
            ctx.fill(CGRect(x: hx, y: hy, width: 45, height: 60))
            ctx.fill(CGRect(x: hx - 22, y: hy + 28, width: 35, height: 18))
            ctx.setLineWidth(3.0)
            ctx.setStrokeColor(CGColor(red: 0.85, green: 0.27, blue: 0.93, alpha: 0.9)) // Soft Magenta outline
            ctx.stroke(CGRect(x: hx, y: hy, width: 45, height: 60))
            ctx.restoreGState()
        } else {
            // Soft Sparkles
            ctx.saveGState()
            for s_i in 0..<12 {
                let sx = CGFloat(width)/2 + CGFloat(sin(Double(s_i) * 1.5 + Double(f) * 0.2) * 180.0)
                let sy = CGFloat(height)/2 + 20.0 + CGFloat((bProg - 0.45) * 450.0 + Double(s_i) * 20.0)
                let sSize: CGFloat = 6.0 + CGFloat(s_i % 4)
                ctx.setFillColor(s_i % 2 == 0 ? CGColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 0.85) : CGColor(red: 0.95, green: 0.35, blue: 0.75, alpha: 0.85))
                ctx.fill(CGRect(x: sx, y: sy, width: sSize, height: sSize))
            }
            ctx.restoreGState()
            
            // Badge
            ctx.saveGState()
            let bx = CGFloat(width)/2 - 270
            let by = CGFloat(height) - 480
            ctx.setFillColor(CGColor(red: 0.09, green: 0.07, blue: 0.15, alpha: 0.92))
            ctx.fill(CGRect(x: bx, y: by, width: 540, height: 65))
            ctx.setLineWidth(3.0)
            ctx.setStrokeColor(CGColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 1.0))
            ctx.stroke(CGRect(x: bx, y: by, width: 540, height: 65))
            ctx.restoreGState()
            
            drawText(ctx: ctx, text: "★ PROOF-OF-BOOP CONFIRMED ★", x: bx + 22, y: 440, font: fontPixel16, color: NSColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 1.0))
        }
    }

    // D. Act 4: Three Tokenomics Badges in Alley Palette
    if f >= 495 && f < 645 {
        let bProg = Double(f - 495) / 150.0
        let badges: [(String, NSColor, Double)] = [
            ("💎 1,000,000,000 FIXED SUPPLY", NSColor(red: 0.18, green: 0.83, blue: 0.75, alpha: 1.0), 0.1),
            ("🚫 0% BUY & SELL TAX", NSColor(red: 0.85, green: 0.27, blue: 0.93, alpha: 1.0), 0.35),
            ("🔥 100% LP BURNED FOREVER", NSColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 1.0), 0.6)
        ]
        
        var cardY = 320.0
        for (title, col, trig) in badges {
            if bProg >= trig {
                let anim = min(1.0, (bProg - trig) * 4.0)
                let offset = (1.0 - anim) * -350.0
                let curY = cardY + offset
                let cgY = CGFloat(height) - CGFloat(curY) - 95.0
                
                ctx.saveGState()
                ctx.setFillColor(CGColor(red: 0.09, green: 0.07, blue: 0.15, alpha: 0.92))
                ctx.fill(CGRect(x: 60, y: cgY, width: CGFloat(width) - 120, height: 95))
                ctx.setFillColor(col.cgColor)
                ctx.fill(CGRect(x: 60, y: cgY, width: 18, height: 95))
                ctx.setLineWidth(2.5)
                ctx.setStrokeColor(col.cgColor)
                ctx.stroke(CGRect(x: 60, y: cgY, width: CGFloat(width) - 120, height: 95))
                ctx.restoreGState()
                
                drawText(ctx: ctx, text: title, x: 105, y: CGFloat(curY) + 34, font: fontPixel16, color: col)
            }
            cardY += 130.0
        }
    }

    // E. Act 5: Clean Portal Cards in Alley Palette
    if f >= 645 {
        let portals: [(String, String, NSColor)] = [
            ("🌐 WEB:", "nosey-cat.vercel.app", NSColor(red: 0.18, green: 0.83, blue: 0.75, alpha: 1.0)),
            ("💬 TG :", "t.me/TheNoseyCat", NSColor(red: 0.85, green: 0.27, blue: 0.93, alpha: 1.0)),
            ("🐦 X  :", "@TheNoseyCat", NSColor(red: 0.98, green: 0.75, blue: 0.14, alpha: 1.0))
        ]
        
        var cardY = 480.0
        for (label, val, col) in portals {
            let cgY = CGFloat(height) - CGFloat(cardY) - 80.0
            ctx.saveGState()
            ctx.setFillColor(CGColor(red: 0.09, green: 0.07, blue: 0.15, alpha: 0.92))
            ctx.fill(CGRect(x: 70, y: cgY, width: CGFloat(width) - 140, height: 80))
            ctx.setLineWidth(2.5)
            ctx.setStrokeColor(col.cgColor)
            ctx.stroke(CGRect(x: 70, y: cgY, width: CGFloat(width) - 140, height: 80))
            ctx.restoreGState()
            
            drawText(ctx: ctx, text: label, x: 105, y: CGFloat(cardY) + 28, font: fontPixel14, color: col)
            drawText(ctx: ctx, text: val, x: 320, y: CGFloat(cardY) + 28, font: fontPixel14, color: .white)
            cardY += 105.0
        }
        
        // Big Action Button
        let pulse = sin(timeSec * 6.0) * 4.0
        let btnY = 880.0
        let btnH = 90.0
        let cgBtnY = CGFloat(height) - CGFloat(btnY) - CGFloat(btnH)
        let bx = 70.0 - pulse
        let bw = Double(width) - 140.0 + pulse * 2.0
        
        ctx.saveGState()
        ctx.setFillColor(CGColor(red: 0.29, green: 0.87, blue: 0.50, alpha: 1.0)) // Soft Mint Green
        ctx.fill(CGRect(x: CGFloat(bx), y: cgBtnY, width: CGFloat(bw), height: CGFloat(btnH)))
        ctx.setLineWidth(3.5)
        ctx.setStrokeColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
        ctx.stroke(CGRect(x: CGFloat(bx), y: cgBtnY, width: CGFloat(bw), height: CGFloat(btnH)))
        ctx.restoreGState()
        
        drawText(ctx: ctx, text: "🕹️ BOOP TO CLAIM DIAMOND PAWS", x: CGFloat(bx) + 65, y: CGFloat(btnY) + 34, font: fontPixel16, color: .black)
    }

    // 4. Draw Harmonious RPG Dialogue Box
    drawRPGBox(ctx: ctx, line1: l1, line2: l2, progress: actProgress, frame: f)

    return buffer
}

print("Rendering master video (780 frames, 30fps) with Apple Silicon hardware acceleration...")

for f in 0..<totalFrames {
    while !writerInput.isReadyForMoreMediaData {
        usleep(500)
    }

    guard let pxBuf = renderMasterFrame(f: f) else {
        print("Failed to render frame \(f)")
        exit(1)
    }

    let timeVal = CMTime(value: CMTimeValue(f), timescale: fps)
    adaptor.append(pxBuf, withPresentationTime: timeVal)

    if f % 120 == 0 {
        let pct = Int((Double(f) / Double(totalFrames)) * 100)
        print("Encoding: \(pct)% (Frame \(f)/\(totalFrames))")
    }
}

writerInput.markAsFinished()

let group = DispatchGroup()
group.enter()
writer.finishWriting {
    print("Master video track encoded!")
    group.leave()
}
group.wait()

// Mux with Ref Audio + Story SFX v2
print("Muxing audio tracks (Ref Music + Story SFX v2)...")
let composition = AVMutableComposition()
let videoAsset = AVURLAsset(url: tempUrl)
let musicAsset = AVURLAsset(url: URL(fileURLWithPath: refMusicPath))
let sfxAsset = AVURLAsset(url: URL(fileURLWithPath: sfxPath))

guard let compVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
      let srcVideoTrack = videoAsset.tracks(withMediaType: .video).first else {
    print("Error: Could not setup video track")
    exit(1)
}

let clipDuration = CMTime(seconds: durationSec, preferredTimescale: 600)
let clipRange = CMTimeRange(start: .zero, duration: clipDuration)
try? compVideoTrack.insertTimeRange(clipRange, of: srcVideoTrack, at: .zero)

// Add Ref Music
if let compMusicTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid),
   let srcMusicTrack = musicAsset.tracks(withMediaType: .audio).first {
    let dur = min(clipDuration, musicAsset.duration)
    try? compMusicTrack.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: srcMusicTrack, at: .zero)
}

// Add SFX
if let compSfxTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid),
   let srcSfxTrack = sfxAsset.tracks(withMediaType: .audio).first {
    let dur = min(clipDuration, sfxAsset.duration)
    try? compSfxTrack.insertTimeRange(CMTimeRange(start: .zero, duration: dur), of: srcSfxTrack, at: .zero)
}

// Export final muxed video
let finalUrl = URL(fileURLWithPath: finalVideoPath)
guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    print("Error: Could not create AVAssetExportSession")
    exit(1)
}

exportSession.outputURL = finalUrl
exportSession.outputFileType = .mp4
exportSession.shouldOptimizeForNetworkUse = true

let exportGroup = DispatchGroup()
exportGroup.enter()
exportSession.exportAsynchronously {
    if exportSession.status == .completed {
        print("SUCCESS! Final Master Story Video created at \(finalVideoPath)")
    } else {
        print("Export failed: \(String(describing: exportSession.error))")
    }
    exportGroup.leave()
}
exportGroup.wait()

// Copy to Downloads & Artifacts
try? FileManager.default.removeItem(atPath: downloadsVideoPath)
try? FileManager.default.removeItem(atPath: artifactVideoPath)

try? FileManager.default.copyItem(atPath: finalVideoPath, toPath: downloadsVideoPath)
try? FileManager.default.copyItem(atPath: finalVideoPath, toPath: artifactVideoPath)

print("Saved final video to:")
print(" - \(downloadsVideoPath)")
print(" - \(artifactVideoPath)")

