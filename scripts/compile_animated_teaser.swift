import Foundation
import AVFoundation
import CoreGraphics
import AppKit

let tempVideoPath = "/tmp/temp_animated_video.mp4"
let finalVideoPath = "public/videos/kepo-genesis-teaser.mp4"
let audioPath = "/tmp/ref_audio.m4a"

try? FileManager.default.removeItem(atPath: tempVideoPath)
try? FileManager.default.removeItem(atPath: finalVideoPath)

let width = 1920
let height = 1080
let fps: Int32 = 30

// 1. Initialize AVAssetWriter for temporary video
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

// 2. Load all 5 base scene images
let scenePaths = [
    "/tmp/kepo_frames/scene_1.jpg",
    "/tmp/kepo_frames/scene_2.jpg",
    "/tmp/kepo_frames/scene_3.jpg",
    "/tmp/kepo_frames/scene_4.jpg",
    "/tmp/kepo_frames/scene_5.jpg"
]

var sceneImages: [CGImage] = []
for p in scenePaths {
    guard let nsImg = NSImage(contentsOfFile: p),
          let cg = nsImg.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("Failed to load \(p)")
        exit(1)
    }
    sceneImages.append(cg)
}

// Scene durations in seconds: [8.5, 9.5, 11.0, 10.0, 10.0] -> Total = 49 seconds
let sceneDurations = [8.5, 9.5, 11.0, 10.0, 10.0]
let transitionDuration = 0.6
let transitionFrames = Int(transitionDuration * Double(fps))

func renderAnimatedPixelBuffer(
    sceneIdx: Int,
    imgA: CGImage,
    imgB: CGImage?,
    alphaB: CGFloat,
    sceneProgress: Double,
    globalFrame: Int
) -> CVPixelBuffer? {
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
    let pxData = CVPixelBufferGetBaseAddress(buffer)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
        data: pxData,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else {
        CVPixelBufferUnlockBaseAddress(buffer, [])
        return nil
    }

    // A. Dynamic Ken Burns Slow Push-In Zoom (1.0 -> 1.045)
    let zoom = 1.0 + 0.045 * sceneProgress
    let zw = CGFloat(width) * CGFloat(zoom)
    let zh = CGFloat(height) * CGFloat(zoom)
    let ox = (CGFloat(width) - zw) / 2.0
    let oy = (CGFloat(height) - zh) / 2.0

    ctx.draw(imgA, in: CGRect(x: ox, y: oy, width: zw, height: zh))

    // B. Crossfade to next scene if in transition
    if let imgB = imgB, alphaB > 0 {
        ctx.saveGState()
        ctx.setAlpha(alphaB)
        let zoomB = 1.0 + 0.045 * (Double(alphaB) * 0.1)
        let zwB = CGFloat(width) * CGFloat(zoomB)
        let zhB = CGFloat(height) * CGFloat(zoomB)
        let oxB = (CGFloat(width) - zwB) / 2.0
        let oyB = (CGFloat(height) - zhB) / 2.0
        ctx.draw(imgB, in: CGRect(x: oxB, y: oyB, width: zwB, height: zhB))
        ctx.restoreGState()
    }

    // C. Animated Cyberpunk Scanline (Sweeping downwards)
    let scanY = (globalFrame * 14) % height
    ctx.saveGState()
    ctx.setFillColor(CGColor(red: 0.78, green: 0.95, blue: 0.11, alpha: 0.07))
    ctx.fill(CGRect(x: 0, y: scanY, width: width, height: 24))
    ctx.setFillColor(CGColor(red: 1.0, green: 1.0, blue: 1.0, alpha: 0.12))
    ctx.fill(CGRect(x: 0, y: scanY + 8, width: width, height: 4))
    ctx.restoreGState()

    // D. Animated Floating Ambient Data Bits (Rising up)
    ctx.saveGState()
    for p in 0..<35 {
        let px = (p * 57 + 30) % width
        let py = (height - ((globalFrame * 4 + p * 37) % height))
        let blink = 0.25 + 0.35 * sin(Double(globalFrame + p * 7) * 0.12)
        ctx.setFillColor(CGColor(red: 0.78, green: 0.95, blue: 0.11, alpha: CGFloat(blink)))
        ctx.fill(CGRect(x: px, y: py, width: 4, height: 4))
    }
    ctx.restoreGState()

    // E. Scene 3 Special Effect: Holographic Foil Sheen Sweeping Across Founder Card
    if sceneIdx == 2 {
        ctx.saveGState()
        // Convert Pillow Y (280..960) to CoreGraphics Y: 1080 - 960 = 120
        let cardRect = CGRect(x: 110, y: 120, width: 540, height: 680)
        ctx.clip(to: cardRect)

        let sheenProgress = (Double(globalFrame % 75) / 75.0) // repeats every 2.5 sec
        let sheenX = CGFloat(cardRect.minX - 250 + sheenProgress * 950)
        
        ctx.setBlendMode(.screen)
        ctx.setFillColor(CGColor(red: 0.0, green: 0.86, blue: 1.0, alpha: 0.35))
        ctx.fill(CGRect(x: sheenX, y: cardRect.minY, width: 70, height: cardRect.height))
        ctx.setFillColor(CGColor(red: 0.78, green: 0.95, blue: 0.11, alpha: 0.45))
        ctx.fill(CGRect(x: sheenX + 25, y: cardRect.minY, width: 30, height: cardRect.height))
        ctx.restoreGState()
    }

    // F. Scene 4 Special Effect: Animated Circuit Pulses from Core to Nodes
    if sceneIdx == 3 {
        ctx.saveGState()
        let cx: CGFloat = 960
        // Convert Pillow Y (640) to CoreGraphics Y: 1080 - 640 = 440
        let cy: CGFloat = 440
        let pulseProgress = (Double(globalFrame % 40) / 40.0) // repeats every 1.3s
        let dist: CGFloat = 360 * CGFloat(pulseProgress)

        let nodeCount = 6
        let angleStep = 2.0 * .pi / Double(nodeCount)
        for n in 0..<nodeCount {
            // In CoreGraphics flipped Y, negate the angle's sin component
            let angle = Double(n) * angleStep - .pi / 2.0
            let nx = cx + dist * CGFloat(cos(angle))
            let ny = cy - dist * CGFloat(sin(angle))
            ctx.setFillColor(CGColor(red: 0.78, green: 0.95, blue: 0.11, alpha: 0.85))
            ctx.fill(CGRect(x: nx - 6, y: ny - 6, width: 12, height: 12))
        }

        // Pulsing glow on center hub (sits exactly over $KEPO CORE)
        let glowAlpha = 0.35 + 0.35 * sin(Double(globalFrame) * 0.18)
        ctx.setStrokeColor(CGColor(red: 0.78, green: 0.95, blue: 0.11, alpha: CGFloat(glowAlpha)))
        ctx.setLineWidth(5)
        ctx.strokeEllipse(in: CGRect(x: cx - 120, y: cy - 120, width: 240, height: 240))
        ctx.restoreGState()
    }

    CVPixelBufferUnlockBaseAddress(buffer, [])
    return buffer
}

var globalFrame: Int = 0

for i in 0..<sceneImages.count {
    let img = sceneImages[i]
    let nextImg = (i < sceneImages.count - 1) ? sceneImages[i + 1] : nil
    let totalFramesForScene = Int(sceneDurations[i] * Double(fps))
    let solidFrames = (nextImg != nil) ? (totalFramesForScene - transitionFrames) : totalFramesForScene

    // Solid frames
    for f in 0..<solidFrames {
        while !writerInput.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.004)
        }
        let sceneProg = Double(f) / Double(totalFramesForScene)
        let time = CMTime(value: Int64(globalFrame), timescale: fps)
        if let buf = renderAnimatedPixelBuffer(
            sceneIdx: i,
            imgA: img,
            imgB: nil,
            alphaB: 0,
            sceneProgress: sceneProg,
            globalFrame: globalFrame
        ) {
            adaptor.append(buf, withPresentationTime: time)
        }
        globalFrame += 1
    }

    // Transition frames
    if let next = nextImg {
        for tf in 0..<transitionFrames {
            while !writerInput.isReadyForMoreMediaData {
                Thread.sleep(forTimeInterval: 0.004)
            }
            let alpha = CGFloat(tf) / CGFloat(transitionFrames)
            let sceneProg = Double(solidFrames + tf) / Double(totalFramesForScene)
            let time = CMTime(value: Int64(globalFrame), timescale: fps)
            if let buf = renderAnimatedPixelBuffer(
                sceneIdx: i,
                imgA: img,
                imgB: next,
                alphaB: alpha,
                sceneProgress: sceneProg,
                globalFrame: globalFrame
            ) {
                adaptor.append(buf, withPresentationTime: time)
            }
            globalFrame += 1
        }
    }
    print("Rendered animated scene \(i + 1)/\(sceneImages.count)")
}

writerInput.markAsFinished()
let group = DispatchGroup()
group.enter()
writer.finishWriting {
    print("Temp animated video complete!")
    group.leave()
}
group.wait()

// 3. Mux with Reference Audio Track
print("Muxing audio track from \(audioPath)...")
let videoAsset = AVURLAsset(url: tempUrl)
let audioAsset = AVURLAsset(url: URL(fileURLWithPath: audioPath))

let composition = AVMutableComposition()
guard let compVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
      let compAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else {
    print("Failed to add composition tracks")
    exit(1)
}

guard let videoTrack = videoAsset.tracks(withMediaType: .video).first,
      let audioTrack = audioAsset.tracks(withMediaType: .audio).first else {
    print("Source video or audio track missing")
    exit(1)
}

let videoDuration = videoAsset.duration
let timeRange = CMTimeRange(start: .zero, duration: videoDuration)

try compVideoTrack.insertTimeRange(timeRange, of: videoTrack, at: .zero)
try compAudioTrack.insertTimeRange(timeRange, of: audioTrack, at: .zero)

guard let exportSession = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    print("Failed to create AVAssetExportSession")
    exit(1)
}

exportSession.outputURL = URL(fileURLWithPath: finalVideoPath)
exportSession.outputFileType = .mp4

let exportGroup = DispatchGroup()
exportGroup.enter()
exportSession.exportAsynchronously {
    if exportSession.status == .completed {
        print("MASTER ANIMATED TEASER WITH AUDIO EXPORTED: \(finalVideoPath)")
    } else {
        print("Export failed: \(String(describing: exportSession.error))")
    }
    exportGroup.leave()
}
exportGroup.wait()

// 4. Copy to Downloads folder as well
let downloadsPath = "/Users/syamhariabidin/Downloads/kepo-genesis-teaser.mp4"
try? FileManager.default.removeItem(atPath: downloadsPath)
try? FileManager.default.copyItem(atPath: finalVideoPath, toPath: downloadsPath)
print("Copied to Downloads folder: \(downloadsPath)")

