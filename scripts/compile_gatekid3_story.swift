import Foundation
import AVFoundation
import CoreGraphics
import CoreText
import AppKit

let tempVideoPath = "/tmp/temp_story_video.mp4"
let finalVideoPath = "public/videos/kepo-story-animation.mp4"
let downloadsVideoPath = "/Users/syamhariabidin/Downloads/kepo-story-animation.mp4"
let artifactVideoPath = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/kepo-story-animation.mp4"

let refMusicPath = "/tmp/ref_audio.m4a"
let sfxPath = "/tmp/story_sfx.m4a"

try? FileManager.default.removeItem(atPath: tempVideoPath)
try? FileManager.default.removeItem(atPath: finalVideoPath)

let width = 1080
let height = 1920
let fps: Int32 = 30
let totalFrames = 780
let durationSec = 26.0

// Register PressStart2P Font
let fontPath = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/scratch/PressStart2P.ttf"
let fontUrl = URL(fileURLWithPath: fontPath) as CFURL
CTFontManagerRegisterFontsForURL(fontUrl, .process, nil)

let fontPixel22 = NSFont(name: "PressStart2P-Regular", size: 22) ?? NSFont.monospacedSystemFont(ofSize: 22, weight: .bold)
let fontPixel18 = NSFont(name: "PressStart2P-Regular", size: 18) ?? NSFont.monospacedSystemFont(ofSize: 18, weight: .bold)
let fontPixel15 = NSFont(name: "PressStart2P-Regular", size: 15) ?? NSFont.monospacedSystemFont(ofSize: 15, weight: .bold)
let fontPixel13 = NSFont(name: "PressStart2P-Regular", size: 13) ?? NSFont.monospacedSystemFont(ofSize: 13, weight: .bold)

// 1. Initialize AVAssetWriter
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
        AVVideoAverageBitRateKey: 8_000_000,
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

// Load Images
func loadCGImage(path: String) -> CGImage? {
    guard let nsImg = NSImage(contentsOfFile: path) else { return nil }
    return nsImg.cgImage(forProposedRect: nil, context: nil, hints: nil)
}

let catCG = loadCGImage(path: "/tmp/cat_isolated.png") ?? loadCGImage(path: "public/mascot-pixel.png")!
let bgStation = loadCGImage(path: "public/banners/nosey-degen-battle-station-1080p.png")
let bgMoon = loadCGImage(path: "public/banners/nosey-moon-mission-1080p.png")
let bgGenesis = loadCGImage(path: "public/banners/kepo-cat-landscape-genesis.jpg")

// Helper: Draw Text with NSAttributedString in CoreGraphics (flipped context)
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
    // CoreGraphics text matrix flip
    ctx.textPosition = CGPoint(x: x, y: CGFloat(height) - y - font.pointSize)
    CTLineDraw(line, ctx)
    ctx.restoreGState()
}

func drawRPGBox(
    ctx: CGContext,
    line1: String,
    line2: String,
    portraitMode: String,
    progress: Double,
    frame: Int
) {
    let boxX: CGFloat = 40
    let boxY: CGFloat = 1360
    let boxW: CGFloat = CGFloat(width) - 80
    let boxH: CGFloat = 500
    
    // CoreGraphics Y is inverted (0 at bottom)
    let cgY = CGFloat(height) - boxY - boxH
    
    ctx.saveGState()
    
    // Drop shadow
    ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 0.8))
    ctx.fill(CGRect(x: boxX + 8, y: cgY - 8, width: boxW, height: boxH))
    
    // Box fill
    ctx.setFillColor(CGColor(red: 0.05, green: 0.07, blue: 0.11, alpha: 0.95))
    ctx.fill(CGRect(x: boxX, y: cgY, width: boxW, height: boxH))
    
    // Double Border
    ctx.setLineWidth(4.0)
    ctx.setStrokeColor(CGColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0)) // Gold
    ctx.stroke(CGRect(x: boxX, y: cgY, width: boxW, height: boxH))
    
    ctx.setLineWidth(3.0)
    ctx.setStrokeColor(CGColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 1.0)) // Neon Green
    ctx.stroke(CGRect(x: boxX + 8, y: cgY + 8, width: boxW - 16, height: boxH - 16))
    
    // Name Tag Header
    let tagW: CGFloat = 460
    let tagH: CGFloat = 40
    let tagY = cgY + boxH - 20
    ctx.setFillColor(CGColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0))
    ctx.fill(CGRect(x: boxX + 30, y: tagY, width: tagW, height: tagH))
    
    // Portrait Frame
    let portSize: CGFloat = 180
    let portX = boxX + 30
    let portY = cgY + boxH - portSize - 60
    ctx.setFillColor(CGColor(red: 0.02, green: 0.03, blue: 0.05, alpha: 1.0))
    ctx.fill(CGRect(x: portX, y: portY, width: portSize, height: portSize))
    ctx.setLineWidth(3.0)
    ctx.setStrokeColor(CGColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 1.0))
    ctx.stroke(CGRect(x: portX, y: portY, width: portSize, height: portSize))
    
    // Cat Head in Portrait
    let headCropRect = CGRect(x: portX + 8, y: portY + 8, width: portSize - 16, height: portSize - 16)
    ctx.draw(catCG, in: headCropRect)
    
    // Portrait special overlay
    if portraitMode == "laser" {
        ctx.setFillColor(CGColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 1.0))
        ctx.fillEllipse(in: CGRect(x: portX + 60, y: portY + 95, width: 14, height: 14))
        ctx.fillEllipse(in: CGRect(x: portX + 98, y: portY + 95, width: 14, height: 14))
    } else if portraitMode == "shades" {
        ctx.setFillColor(CGColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0))
        ctx.fill(CGRect(x: portX + 50, y: portY + 92, width: 30, height: 18))
        ctx.fill(CGRect(x: portX + 92, y: portY + 92, width: 30, height: 18))
        ctx.setLineWidth(2.0)
        ctx.setStrokeColor(CGColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0))
        ctx.stroke(CGRect(x: portX + 50, y: portY + 92, width: 30, height: 18))
        ctx.stroke(CGRect(x: portX + 92, y: portY + 92, width: 30, height: 18))
    }
    
    ctx.restoreGState()
    
    // Name Tag Text
    drawText(ctx: ctx, text: "★ KEPO CAT [SNOOT LORE]", x: boxX + 45, y: boxY - 10, font: fontPixel15, color: .black)
    
    // Typewriter text reveal
    let fullChars = line1.count + line2.count
    let visibleTotal = Int(Double(fullChars) * min(1.0, progress * 1.3))
    
    let vLine1 = String(line1.prefix(visibleTotal))
    var vLine2 = ""
    if visibleTotal > line1.count {
        vLine2 = String(line2.prefix(visibleTotal - line1.count))
    }
    
    let textX = boxX + portSize + 50
    drawText(ctx: ctx, text: vLine1, x: textX, y: boxY + 65, font: fontPixel18, color: .white)
    drawText(ctx: ctx, text: vLine2, x: textX, y: boxY + 120, font: fontPixel18, color: NSColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 1.0))
    
    // Blinking prompt triangle
    if progress >= 0.85 && (frame % 20 < 10) {
        ctx.saveGState()
        ctx.setFillColor(CGColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0))
        let triX = boxX + boxW - 45
        let triY = cgY + 30
        let path = CGMutablePath()
        path.move(to: CGPoint(x: triX, y: triY + 15))
        path.addLine(to: CGPoint(x: triX + 20, y: triY + 15))
        path.addLine(to: CGPoint(x: triX + 10, y: triY))
        path.closeSubpath()
        ctx.addPath(path)
        ctx.fillPath()
        ctx.restoreGState()
    }
}

func renderFrame(f: Int) -> CVPixelBuffer? {
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

    // Clear background
    ctx.setFillColor(CGColor(red: 0.04, green: 0.05, blue: 0.08, alpha: 1.0))
    ctx.fill(CGRect(x: 0, y: 0, width: width, height: height))

    let timeSec = Double(f) / Double(fps)
    let stageRect = CGRect(x: 0, y: CGFloat(height) - 1340, width: CGFloat(width), height: 1340)

    // -------------------------------------------------------------
    // ACT 1: THE SNOOT SNIFF (0 - 155 frames)
    // -------------------------------------------------------------
    if f < 156 {
        let prog = Double(f) / 156.0
        if let bg = bgStation { ctx.draw(bg, in: stageRect) }
        
        // Cat bounce and curious tilt
        let bounce = sin(timeSec * 5.0) * 8.0
        let catSize: CGFloat = 580
        let catX = CGFloat(width) / 2.0 - catSize / 2.0
        let catY = CGFloat(height) - 1340 + 80 + CGFloat(bounce)
        
        ctx.saveGState()
        if prog > 0.25 {
            // -20° tilt
            let rotProg = min(1.0, (prog - 0.25) * 3.0)
            let angle = -20.0 * .pi / 180.0 * rotProg
            ctx.translateBy(x: catX + catSize/2, y: catY + catSize/2)
            ctx.rotate(by: CGFloat(angle))
            ctx.translateBy(x: -(catX + catSize/2), y: -(catY + catSize/2))
        }
        ctx.draw(catCG, in: CGRect(x: catX, y: catY, width: catSize, height: catSize))
        ctx.restoreGState()
        
        if prog > 0.4 {
            // Exclamation badge
            ctx.saveGState()
            ctx.setFillColor(CGColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0))
            let exY = CGFloat(height) - 520
            ctx.fill(CGRect(x: CGFloat(width)/2 + 80, y: exY, width: 25, height: 60))
            ctx.fill(CGRect(x: CGFloat(width)/2 + 80, y: exY - 25, width: 25, height: 18))
            
            // Laser beams
            ctx.setLineWidth(6.0)
            ctx.setStrokeColor(CGColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 1.0))
            ctx.strokeLineSegments(between: [
                CGPoint(x: catX + catSize/2 - 40, y: catY + 390), CGPoint(x: 0, y: CGFloat(height) - 300),
                CGPoint(x: catX + catSize/2 + 40, y: catY + 390), CGPoint(x: CGFloat(width), y: CGFloat(height) - 300)
            ])
            ctx.restoreGState()
            
            drawText(ctx: ctx, text: "+420% PUMP", x: 120, y: 450, font: fontPixel18, color: NSColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 1.0))
            drawText(ctx: ctx, text: "+1337x MOON", x: CGFloat(width) - 360, y: 480, font: fontPixel18, color: NSColor(red: 0.08, green: 0.95, blue: 0.58, alpha: 1.0))
        }
        
        let l1 = "Normal cats look away..."
        let l2 = "Me? I sniff green candles before Raydium notices!"
        let pMode = (prog > 0.45) ? "laser" : "normal"
        drawRPGBox(ctx: ctx, line1: l1, line2: l2, portraitMode: pMode, progress: prog, frame: f)
    }
    // -------------------------------------------------------------
    // ACT 2: PROOF-OF-BOOP (156 - 311 frames)
    // -------------------------------------------------------------
    else if f < 312 {
        let prog = Double(f - 156) / 156.0
        if let bg = bgStation { ctx.draw(bg, in: stageRect) }
        
        // Dim stage for focus
        ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 0.55))
        ctx.fill(stageRect)
        
        let catSize: CGFloat = 850
        let catX = CGFloat(width)/2 - catSize/2
        let catY = CGFloat(height) - 1340 + 140
        ctx.draw(catCG, in: CGRect(x: catX, y: catY, width: catSize, height: catSize))
        
        let noseX = CGFloat(width) / 2.0 + 10.0
        let noseY = catY + 540.0
        
        if prog < 0.42 {
            // Hand cursor moving in
            let handT = CGFloat(prog / 0.42)
            let hx = CGFloat(width) + 50.0 - handT * (CGFloat(width) - noseX + 80.0)
            let hy = CGFloat(height) - 1100.0 + handT * (1100.0 - (CGFloat(height) - noseY))
            
            ctx.saveGState()
            ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
            ctx.fill(CGRect(x: hx, y: hy, width: 45, height: 65))
            ctx.fill(CGRect(x: hx - 20, y: hy + 35, width: 40, height: 20))
            ctx.restoreGState()
            drawText(ctx: ctx, text: "CLICK!", x: hx - 80, y: CGFloat(height) - hy - 40, font: fontPixel13, color: NSColor(red: 1.0, green: 0.31, blue: 0.71, alpha: 1.0))
        } else {
            // Concentric shockwaves
            let ripT = CGFloat(prog - 0.42) * 5.0
            ctx.saveGState()
            for r in [50.0, 110.0, 180.0, 270.0, 380.0] {
                let curR = CGFloat(r) * ripT
                if curR < 500 {
                    let alpha = max(0.0, 1.0 - Double(curR / 500.0))
                    ctx.setLineWidth(5.0)
                    ctx.setStrokeColor(CGColor(red: 1.0, green: 0.31, blue: 0.71, alpha: CGFloat(alpha)))
                    ctx.strokeEllipse(in: CGRect(x: noseX - curR, y: noseY - curR, width: curR * 2, height: curR * 2))
                }
            }
            ctx.restoreGState()
            
            // Big Boop Badge
            let badgeY = 320.0 - sin((prog - 0.42) * 10.0) * 15.0
            ctx.saveGState()
            ctx.setFillColor(CGColor(red: 1.0, green: 0.31, blue: 0.71, alpha: 1.0))
            let bx = CGFloat(width)/2 - 280
            let by = CGFloat(height) - CGFloat(badgeY) - 75
            ctx.fill(CGRect(x: bx, y: by, width: 560, height: 75))
            ctx.setLineWidth(4.0)
            ctx.setStrokeColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
            ctx.stroke(CGRect(x: bx, y: by, width: 560, height: 75))
            ctx.restoreGState()
            drawText(ctx: ctx, text: "🐾 * BOOP! +1000 POB *", x: bx + 35, y: CGFloat(badgeY) + 20, font: fontPixel18, color: .white)
        }
        
        let l1 = "Proof-of-Boop (PoB) activated!"
        let l2 = "It's a crime to visit without booping my pink snoot!"
        drawRPGBox(ctx: ctx, line1: l1, line2: l2, portraitMode: "normal", progress: prog, frame: f)
    }
    // -------------------------------------------------------------
    // ACT 3: SOLANA FURNACE & 1B SUPPLY (312 - 467 frames)
    // -------------------------------------------------------------
    else if f < 468 {
        let prog = Double(f - 312) / 156.0
        if let bg = bgGenesis { ctx.draw(bg, in: stageRect) }
        
        // Animated Pixel Flames at stage bottom
        ctx.saveGState()
        for fl_i in 0..<16 {
            let flX = CGFloat(60 + fl_i * 62)
            let flH = CGFloat(110.0 + sin(Double(fl_i) + Double(f) * 0.4) * 40.0)
            let flY = CGFloat(height) - 1340
            let path = CGMutablePath()
            path.move(to: CGPoint(x: flX, y: flY))
            path.addLine(to: CGPoint(x: flX + 31, y: flY + flH))
            path.addLine(to: CGPoint(x: flX + 62, y: flY))
            path.closeSubpath()
            ctx.setFillColor(fl_i % 2 == 0 ? CGColor(red: 1.0, green: 0.35, blue: 0.1, alpha: 1.0) : CGColor(red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0))
            ctx.addPath(path)
            ctx.fillPath()
        }
        ctx.restoreGState()
        
        // 3 Badges Slamming Down
        let badges: [(String, NSColor, Double)] = [
            ("💎 1,000,000,000 FIXED SUPPLY", NSColor(red: 0, green: 1, blue: 0.4, alpha: 1), 0.1),
            ("🚫 0% BUY & 0% SELL TAX", NSColor(red: 0.08, green: 0.95, blue: 0.58, alpha: 1), 0.35),
            ("🔥 100% LP BURNED IN FURNACE", NSColor(red: 1, green: 0.84, blue: 0, alpha: 1), 0.6)
        ]
        
        var byPos = 240.0
        for (title, col, trig) in badges {
            if prog >= trig {
                let anim = min(1.0, (prog - trig) * 4.0)
                let offset = (1.0 - anim) * -400.0
                let actualY = byPos + offset
                let cgY = CGFloat(height) - CGFloat(actualY) - 110.0
                
                ctx.saveGState()
                ctx.setFillColor(CGColor(red: 0.05, green: 0.07, blue: 0.11, alpha: 0.95))
                ctx.fill(CGRect(x: 60, y: cgY, width: CGFloat(width) - 120, height: 110))
                ctx.setFillColor(col.cgColor)
                ctx.fill(CGRect(x: 60, y: cgY, width: 25, height: 110))
                ctx.setLineWidth(3.0)
                ctx.setStrokeColor(col.cgColor)
                ctx.stroke(CGRect(x: 60, y: cgY, width: CGFloat(width) - 120, height: 110))
                ctx.restoreGState()
                
                drawText(ctx: ctx, text: title, x: 110, y: CGFloat(actualY) + 38, font: fontPixel18, color: col)
            }
            byPos += 150.0
        }
        
        // Cat throwing key
        let catSize: CGFloat = 440
        ctx.draw(catCG, in: CGRect(x: CGFloat(width) - 460, y: CGFloat(height) - 1340 + 60, width: catSize, height: catSize))
        
        let l1 = "Zero developer tax. No insider dumping."
        let l2 = "1B supply. 100% LP burned forever in the furnace!"
        drawRPGBox(ctx: ctx, line1: l1, line2: l2, portraitMode: "normal", progress: prog, frame: f)
    }
    // -------------------------------------------------------------
    // ACT 4: MOON MISSION (468 - 623 frames)
    // -------------------------------------------------------------
    else if f < 624 {
        let prog = Double(f - 468) / 156.0
        if let bg = bgMoon { ctx.draw(bg, in: stageRect) }
        
        let rocketT = max(0.0, (prog - 0.25) / 0.75)
        let rx = CGFloat(width)/2 - 120 + CGFloat(rocketT * 300)
        let ry = CGFloat(height) - 1340 + 60 + CGFloat(rocketT * 750)
        
        ctx.saveGState()
        // Rocket Body
        ctx.setFillColor(CGColor(red: 0, green: 1, blue: 0.4, alpha: 1))
        ctx.fill(CGRect(x: rx, y: ry, width: 140, height: 260))
        ctx.setLineWidth(4.0)
        ctx.setStrokeColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
        ctx.stroke(CGRect(x: rx, y: ry, width: 140, height: 260))
        
        // Cone
        let conePath = CGMutablePath()
        conePath.move(to: CGPoint(x: rx, y: ry + 260))
        conePath.addLine(to: CGPoint(x: rx + 70, y: ry + 340))
        conePath.addLine(to: CGPoint(x: rx + 140, y: ry + 260))
        conePath.closeSubpath()
        ctx.addPath(conePath)
        ctx.fillPath()
        
        // Rocket exhaust flames
        if rocketT > 0 {
            let flH = CGFloat(120.0 + sin(Double(f) * 0.8) * 35.0)
            let flPath = CGMutablePath()
            flPath.move(to: CGPoint(x: rx + 20, y: ry))
            flPath.addLine(to: CGPoint(x: rx + 70, y: ry - flH))
            flPath.addLine(to: CGPoint(x: rx + 120, y: ry))
            flPath.closeSubpath()
            ctx.setFillColor(CGColor(red: 1, green: 0.84, blue: 0, alpha: 1))
            ctx.addPath(flPath)
            ctx.fillPath()
        }
        ctx.restoreGState()
        
        drawText(ctx: ctx, text: "KEPO", x: rx + 25, y: CGFloat(height) - ry - 140, font: fontPixel18, color: .black)
        
        // Cat riding rocket
        let catSize: CGFloat = 300
        ctx.draw(catCG, in: CGRect(x: rx - 50, y: ry + 90, width: catSize, height: catSize))
        
        // Sunglasses on cat
        ctx.saveGState()
        ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
        ctx.fill(CGRect(x: rx + 45, y: ry + 230, width: 35, height: 20))
        ctx.fill(CGRect(x: rx + 95, y: ry + 230, width: 35, height: 20))
        ctx.setLineWidth(2.0)
        ctx.setStrokeColor(CGColor(red: 1, green: 0.84, blue: 0, alpha: 1))
        ctx.stroke(CGRect(x: rx + 45, y: ry + 230, width: 35, height: 20))
        ctx.stroke(CGRect(x: rx + 95, y: ry + 230, width: 35, height: 20))
        ctx.restoreGState()
        
        let l1 = "Stage 1 Genesis: 50 Diamond Paws."
        let l2 = "Diamond paws hold the line. Next stop: THE MOON!"
        drawRPGBox(ctx: ctx, line1: l1, line2: l2, portraitMode: "shades", progress: prog, frame: f)
    }
    // -------------------------------------------------------------
    // ACT 5: GRAND OUTRO & CTA (624 - 779 frames)
    // -------------------------------------------------------------
    else {
        let prog = Double(f - 624) / 156.0
        if let bg = bgMoon { ctx.draw(bg, in: stageRect) }
        
        // Cat on Moon
        let catSize: CGFloat = 400
        let catX = CGFloat(width)/2 - catSize/2
        let catY = CGFloat(height) - 1340 + 720
        ctx.draw(catCG, in: CGRect(x: catX, y: catY, width: catSize, height: catSize))
        
        // Sunglasses on cat
        ctx.saveGState()
        ctx.setFillColor(CGColor(red: 0, green: 0, blue: 0, alpha: 1))
        ctx.fill(CGRect(x: catX + 135, y: catY + 280, width: 45, height: 25))
        ctx.fill(CGRect(x: catX + 220, y: catY + 280, width: 45, height: 25))
        ctx.setLineWidth(3.0)
        ctx.setStrokeColor(CGColor(red: 1, green: 0.84, blue: 0, alpha: 1))
        ctx.stroke(CGRect(x: catX + 135, y: catY + 280, width: 45, height: 25))
        ctx.stroke(CGRect(x: catX + 220, y: catY + 280, width: 45, height: 25))
        ctx.restoreGState()
        
        // 3 Portal Cards
        let portals: [(String, String, NSColor)] = [
            ("🌐 WEBSITE:", "nosey-cat.vercel.app", NSColor(red: 0, green: 1, blue: 0.4, alpha: 1)),
            ("💬 TELEGRAM:", "t.me/TheNoseyCat", NSColor(red: 0.08, green: 0.95, blue: 0.58, alpha: 1)),
            ("🐦 X (TWITTER):", "@TheNoseyCat", NSColor(red: 1, green: 0.84, blue: 0, alpha: 1))
        ]
        
        var py = 740.0
        for (label, val, col) in portals {
            let cgY = CGFloat(height) - CGFloat(py) - 85.0
            ctx.saveGState()
            ctx.setFillColor(CGColor(red: 0.05, green: 0.07, blue: 0.11, alpha: 0.95))
            ctx.fill(CGRect(x: 80, y: cgY, width: CGFloat(width) - 160, height: 85))
            ctx.setLineWidth(3.0)
            ctx.setStrokeColor(col.cgColor)
            ctx.stroke(CGRect(x: 80, y: cgY, width: CGFloat(width) - 160, height: 85))
            ctx.restoreGState()
            
            drawText(ctx: ctx, text: label, x: 110, y: CGFloat(py) + 30, font: fontPixel15, color: col)
            drawText(ctx: ctx, text: val, x: 420, y: CGFloat(py) + 30, font: fontPixel15, color: .white)
            py += 115.0
        }
        
        // Big Action Button
        let pulse = sin(Double(f) * 0.3) * 6.0
        let btnY = 1130.0
        let btnH = 95.0
        let cgBtnY = CGFloat(height) - CGFloat(btnY) - CGFloat(btnH)
        let bx = 80.0 - pulse
        let bw = Double(width) - 160.0 + pulse * 2.0
        
        ctx.saveGState()
        ctx.setFillColor(CGColor(red: 0, green: 1, blue: 0.4, alpha: 1))
        ctx.fill(CGRect(x: CGFloat(bx), y: cgBtnY, width: CGFloat(bw), height: CGFloat(btnH)))
        ctx.setLineWidth(4.0)
        ctx.setStrokeColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
        ctx.stroke(CGRect(x: CGFloat(bx), y: cgBtnY, width: CGFloat(bw), height: CGFloat(btnH)))
        ctx.restoreGState()
        
        drawText(ctx: ctx, text: "🕹️ BOOP TO CLAIM DIAMOND PAWS", x: CGFloat(bx) + 65, y: CGFloat(btnY) + 35, font: fontPixel18, color: .black)
        
        let l1 = "Curiosity sent this cat to the moon!"
        let l2 = "Boop the snoot at nosey-cat.vercel.app!"
        drawRPGBox(ctx: ctx, line1: l1, line2: l2, portraitMode: "shades", progress: prog, frame: f)
    }

    return buffer
}

print("Encoding 780 frames with native Apple Silicon hardware acceleration...")

for f in 0..<totalFrames {
    while !writerInput.isReadyForMoreMediaData {
        usleep(500)
    }

    guard let pxBuf = renderFrame(f: f) else {
        print("Failed to render frame \(f)")
        exit(1)
    }

    let timeVal = CMTime(value: CMTimeValue(f), timescale: fps)
    adaptor.append(pxBuf, withPresentationTime: timeVal)

    if f % 120 == 0 {
        let pct = Int((Double(f) / Double(totalFrames)) * 100)
        print("Progress: \(pct)% (Frame \(f)/\(totalFrames))")
    }
}

writerInput.markAsFinished()

let group = DispatchGroup()
group.enter()
writer.finishWriting {
    print("Video track finished writing!")
    group.leave()
}
group.wait()

// Mux with Ref Audio + Story SFX
print("Muxing audio tracks (Ref Music + Story SFX)...")
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
        print("SUCCESS! Final Story Video created at \(finalVideoPath)")
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
