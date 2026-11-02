import Cocoa
import AVFoundation
import CoreGraphics

let width = 1920
let height = 1080
let fps: Int32 = 30
let totalSeconds: Double = 68.2
let totalFrames = Int(totalSeconds * Double(fps)) // 2046 frames

let scenePaths = [
    "/tmp/antislop_scenes/scene1_moods.png",
    "/tmp/antislop_scenes/scene2_problem.png",
    "/tmp/antislop_scenes/scene3_step01.png",
    "/tmp/antislop_scenes/scene4_step02.png",
    "/tmp/antislop_scenes/scene5_ecosystem.png",
    "/tmp/antislop_scenes/scene6_website.png",
    "/tmp/antislop_scenes/scene7_outro.png"
]

// Scene start frames (total 2046 frames)
let sceneStarts = [
    0,     // Scene 1: 0.0s (frame 0)
    390,   // Scene 2: 13.0s (frame 390)
    660,   // Scene 3: 22.0s (frame 660)
    930,   // Scene 4: 31.0s (frame 930)
    1200,  // Scene 5: 40.0s (frame 1200)
    1470,  // Scene 6: 49.0s (frame 1470)
    1710,  // Scene 7: 57.0s (frame 1710)
    totalFrames // End: 68.2s (frame 2046)
]

print("Loading 7 scene images...")
var sceneImages: [CGImage] = []
for p in scenePaths {
    guard let nsImg = NSImage(contentsOfFile: p),
          let cg = nsImg.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("Error loading image:", p)
        exit(1)
    }
    sceneImages.append(cg)
}

let tempVideoURL = URL(fileURLWithPath: "/tmp/antislop_video_raw.mp4")
try? FileManager.default.removeItem(at: tempVideoURL)

guard let videoWriter = try? AVAssetWriter(outputURL: tempVideoURL, fileType: .mp4) else {
    print("Cannot create video writer")
    exit(1)
}

let videoSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 14_000_000,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
]

let writerInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
writerInput.expectsMediaDataInRealTime = false

let attributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32ARGB),
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
    kCVPixelBufferCGImageCompatibilityKey as String: true
]

let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: writerInput, sourcePixelBufferAttributes: attributes)

videoWriter.add(writerInput)
videoWriter.startWriting()
videoWriter.startSession(atSourceTime: .zero)

func pixelBufferFromCGImage(image: CGImage, nextImage: CGImage?, blend: CGFloat, progress: CGFloat, sceneIdx: Int, frameInScene: Int) -> CVPixelBuffer? {
    var pixelBuffer: CVPixelBuffer?
    let status = CVPixelBufferCreate(kCFAllocatorDefault, width, height, kCVPixelFormatType_32ARGB, nil, &pixelBuffer)
    guard status == kCVReturnSuccess, let pb = pixelBuffer else { return nil }

    CVPixelBufferLockBaseAddress(pb, [])
    defer { CVPixelBufferUnlockBaseAddress(pb, []) }

    let pxData = CVPixelBufferGetBaseAddress(pb)
    let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
        data: pxData,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(pb),
        space: rgbColorSpace,
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else {
        return nil
    }

    ctx.interpolationQuality = .high

    // 1. Base rendering with Ken Burns Push-in (1.0x -> 1.035x)
    let zoom: CGFloat = 1.0 + 0.035 * progress
    let zw = CGFloat(width) * zoom
    let zh = CGFloat(height) * zoom
    let zx = (CGFloat(width) - zw) / 2.0
    let zy = (CGFloat(height) - zh) / 2.0

    ctx.saveGState()
    ctx.setAlpha(1.0 - blend)
    ctx.draw(image, in: CGRect(x: zx, y: zy, width: zw, height: zh))
    ctx.restoreGState()

    if let nxt = nextImage, blend > 0.001 {
        ctx.saveGState()
        ctx.setAlpha(blend)
        let nxtZoom: CGFloat = 1.0
        let nzw = CGFloat(width) * nxtZoom
        let nzh = CGFloat(height) * nxtZoom
        let nzx = (CGFloat(width) - nzw) / 2.0
        let nzy = (CGFloat(height) - nzh) / 2.0
        ctx.draw(nxt, in: CGRect(x: nzx, y: nzy, width: nzw, height: nzh))
        ctx.restoreGState()
    }

    // 2. Scene-specific Dynamic Animations
    let t = CGFloat(frameInScene)

    if sceneIdx == 2 {
        // Scene 3: Holographic Foil Sheen reflection over the Founder Card
        // In CoreGraphics: Card area is card_x = 180, card_w = 480, height = 1080, y_top = 140, card_h = 680
        // In CG Y (bottom=0): card_y_cg = 1080 - 140 - 680 = 260.
        let cardRect = CGRect(x: 180, y: 260, width: 480, height: 680)
        let cycle = fmod(t, 90.0) / 90.0
        let sheenX = cardRect.minX - 100.0 + (cardRect.width + 300.0) * cycle

        ctx.saveGState()
        ctx.clip(to: cardRect)
        ctx.setBlendMode(.screen)
        
        // Diagonal beam
        ctx.beginPath()
        ctx.move(to: CGPoint(x: sheenX, y: cardRect.minY))
        ctx.addLine(to: CGPoint(x: sheenX + 100, y: cardRect.minY))
        ctx.addLine(to: CGPoint(x: sheenX + 220, y: cardRect.maxY))
        ctx.addLine(to: CGPoint(x: sheenX + 120, y: cardRect.maxY))
        ctx.closePath()
        
        ctx.setFillColor(red: 0.8, green: 1.0, blue: 0.9, alpha: 0.28)
        ctx.fillPath()
        ctx.restoreGState()
    }
    else if sceneIdx == 4 {
        // Scene 5: Glowing pulse on center $KEPO CORE and circuit pulses outward
        let cx: CGFloat = CGFloat(width) / 2.0
        let cy: CGFloat = CGFloat(height) - 450.0 // CG coordinates: 630
        
        let pulseCycle = fmod(t, 45.0) / 45.0
        let pulseR = 150.0 + 80.0 * pulseCycle
        let pulseAlpha = 0.5 * (1.0 - pulseCycle)

        ctx.saveGState()
        ctx.setBlendMode(.screen)
        ctx.setStrokeColor(red: 0.78, green: 0.98, blue: 0.0, alpha: pulseAlpha)
        ctx.setLineWidth(3.0)
        ctx.strokeEllipse(in: CGRect(x: cx - pulseR, y: cy - pulseR, width: pulseR * 2, height: pulseR * 2))

        // Signal dots moving outward along 6 lines
        let satelliteCGs: [CGPoint] = [
            CGPoint(x: 300, y: CGFloat(height) - 240),
            CGPoint(x: 260, y: CGFloat(height) - 450),
            CGPoint(x: 300, y: CGFloat(height) - 660),
            CGPoint(x: 1620, y: CGFloat(height) - 240),
            CGPoint(x: 1660, y: CGFloat(height) - 450),
            CGPoint(x: 1620, y: CGFloat(height) - 660)
        ]

        let dotProgress = fmod(t, 30.0) / 30.0
        ctx.setFillColor(red: 0.78, green: 0.98, blue: 0.0, alpha: 0.9)
        for sat in satelliteCGs {
            let px = cx + (sat.x - cx) * dotProgress
            let py = cy + (sat.y - cy) * dotProgress
            ctx.fillEllipse(in: CGRect(x: px - 5, y: py - 5, width: 10, height: 10))
        }
        ctx.restoreGState()
    }
    else if sceneIdx == 3 {
        // Scene 4: Flowchart signal dots moving between Step 1 -> Step 2 -> Step 3
        let dotT = fmod(t, 40.0) / 40.0
        let arrow1_start = CGPoint(x: 700, y: CGFloat(height) - 300)
        let arrow1_end = CGPoint(x: 770, y: CGFloat(height) - 300)
        let arrow2_start = CGPoint(x: 1250, y: CGFloat(height) - 300)
        let arrow2_end = CGPoint(x: 1320, y: CGFloat(height) - 300)

        ctx.saveGState()
        ctx.setBlendMode(.screen)
        ctx.setFillColor(red: 0.78, green: 0.98, blue: 0.0, alpha: 0.95)
        
        let p1x = arrow1_start.x + (arrow1_end.x - arrow1_start.x) * dotT
        ctx.fillEllipse(in: CGRect(x: p1x - 4, y: arrow1_start.y - 4, width: 8, height: 8))

        let p2x = arrow2_start.x + (arrow2_end.x - arrow2_start.x) * dotT
        ctx.fillEllipse(in: CGRect(x: p2x - 4, y: arrow2_start.y - 4, width: 8, height: 8))
        ctx.restoreGState()
    }

    return pb
}

print("Rendering \(totalFrames) video frames at 30 FPS...")

let transitionFrames = 15 // 0.5s smooth crossfade

for frameIndex in 0..<totalFrames {
    // Find active scene
    var activeScene = 0
    while activeScene < sceneStarts.count - 2 && frameIndex >= sceneStarts[activeScene + 1] {
        activeScene += 1
    }

    let start = sceneStarts[activeScene]
    let end = sceneStarts[activeScene + 1]
    let sceneLen = end - start
    let frameInScene = frameIndex - start
    let progress = CGFloat(frameInScene) / CGFloat(sceneLen)

    // Blend logic for transition
    var blend: CGFloat = 0.0
    var nextImg: CGImage? = nil

    let framesUntilNext = end - frameIndex
    if framesUntilNext <= transitionFrames && activeScene + 1 < sceneImages.count {
        blend = CGFloat(transitionFrames - framesUntilNext) / CGFloat(transitionFrames)
        nextImg = sceneImages[activeScene + 1]
    }

    let curImg = sceneImages[activeScene]

    while !adaptor.assetWriterInput.isReadyForMoreMediaData {
        usleep(1000)
    }

    if let pb = pixelBufferFromCGImage(
        image: curImg,
        nextImage: nextImg,
        blend: blend,
        progress: progress,
        sceneIdx: activeScene,
        frameInScene: frameInScene
    ) {
        let pts = CMTime(value: Int64(frameIndex), timescale: fps)
        adaptor.append(pb, withPresentationTime: pts)
    }

    if frameIndex % 150 == 0 {
        let pct = Int(Double(frameIndex) / Double(totalFrames) * 100)
        print("Progress: \(pct)% (Frame \(frameIndex)/\(totalFrames))")
    }
}

writerInput.markAsFinished()

let group = DispatchGroup()
group.enter()
videoWriter.finishWriting {
    print("Video track finished writing.")
    group.leave()
}
group.wait()

// ==============================================================================
// STEP 2: MUX WITH AUDIO TRACK (/tmp/ref_audio.m4a)
// ==============================================================================
print("Muxing video with original audio soundtrack...")

let audioURL = URL(fileURLWithPath: "/tmp/ref_audio.m4a")
let finalMasterURL = URL(fileURLWithPath: "/Users/syamhariabidin/Downloads/kepo-genesis-teaser.mp4")
try? FileManager.default.removeItem(at: finalMasterURL)

let composition = AVMutableComposition()
let videoAsset = AVURLAsset(url: tempVideoURL)
let audioAsset = AVURLAsset(url: audioURL)

let compVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)
let compAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)

if let vTrack = videoAsset.tracks(withMediaType: .video).first {
    let timeRange = CMTimeRange(start: .zero, duration: videoAsset.duration)
    try? compVideoTrack?.insertTimeRange(timeRange, of: vTrack, at: .zero)
}

if let aTrack = audioAsset.tracks(withMediaType: .audio).first {
    let dur = min(audioAsset.duration, videoAsset.duration)
    let timeRange = CMTimeRange(start: .zero, duration: dur)
    try? compAudioTrack?.insertTimeRange(timeRange, of: aTrack, at: .zero)
}

guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    print("Cannot create export session")
    exit(1)
}

exportSession.outputURL = finalMasterURL
exportSession.outputFileType = .mp4

let exportGroup = DispatchGroup()
exportGroup.enter()
exportSession.exportAsynchronously {
    if exportSession.status == .completed {
        print("SUCCESS! Final Master Presentation Video generated at:")
        print(finalMasterURL.path)
    } else {
        print("Export failed:", exportSession.error ?? "unknown")
    }
    exportGroup.leave()
}
exportGroup.wait()

// Copy to public/videos/kepo-genesis-teaser.mp4 for web app
let webTarget = "/Users/syamhariabidin/MEME_coin/public/videos/kepo-genesis-teaser.mp4"
try? FileManager.default.removeItem(atPath: webTarget)
try? FileManager.default.copyItem(atPath: finalMasterURL.path, toPath: webTarget)
print("Updated web asset at:", webTarget)

