import Foundation
import AVFoundation
import CoreGraphics
import AppKit

let tempVideoPath = "/tmp/temp_9x16_video.mp4"
let finalVideoPath = "public/videos/kepo-strategy-short-9x16.mp4"
let downloadsVideoPath = "/Users/syamhariabidin/Downloads/kepo-strategy-short-9x16.mp4"
let artifactVideoPath = "/Users/syamhariabidin/.gemini/antigravity/brain/bd6e8a70-7d1b-41c9-8405-dc2638ed43db/kepo-strategy-short-9x16.mp4"
let audioPath = "/tmp/ref_audio.m4a"

try? FileManager.default.removeItem(atPath: tempVideoPath)
try? FileManager.default.removeItem(atPath: finalVideoPath)

let width = 1080
let height = 1920
let fps: Int32 = 30
let totalSeconds: Double = 30.0
let totalFrames = Int(totalSeconds * Double(fps))

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

// 2. Load 5 Scene Images
let scenePaths = [
    "/tmp/kepo_9x16_scenes/scene_1_hook.png",
    "/tmp/kepo_9x16_scenes/scene_2_ecosystem.png",
    "/tmp/kepo_9x16_scenes/scene_3_tokenomics.png",
    "/tmp/kepo_9x16_scenes/scene_4_milestones.png",
    "/tmp/kepo_9x16_scenes/scene_5_calltoaction.png"
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

// 5 scenes, 6.0 seconds each -> exactly 30.0s total
let sceneDurations = [6.0, 6.0, 6.0, 6.0, 6.0]
let transitionDuration = 0.5
let transitionFrames = Int(transitionDuration * Double(fps))

func renderFramePixelBuffer(
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
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    guard let pxData = CVPixelBufferGetBaseAddress(buffer) else { return nil }

    let rgbColorSpace = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
        data: pxData,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: rgbColorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    ) else {
        return nil
    }

    ctx.saveGState()

    // 1. Dynamic Camera Subtle Zoom (1.00 to 1.03) with beat pulse
    let beatPhase = sin(Double(globalFrame) * 0.35)
    let zoom = 1.0 + 0.02 * sin(sceneProgress * .pi) + 0.008 * beatPhase
    let tx = Double(width) * (1.0 - zoom) / 2.0
    let ty = Double(height) * (1.0 - zoom) / 2.0
    ctx.translateBy(x: CGFloat(tx), y: CGFloat(ty))
    ctx.scaleBy(x: CGFloat(zoom), y: CGFloat(zoom))

    let fullRect = CGRect(x: 0, y: 0, width: width, height: height)

    // Draw base Image A
    ctx.draw(imgA, in: fullRect)

    // Crossfade to Image B if in transition
    if let b = imgB, alphaB > 0 {
        ctx.saveGState()
        ctx.setAlpha(alphaB)
        ctx.draw(b, in: fullRect)
        ctx.restoreGState()

        // Cyber scanline wipe during transition
        ctx.saveGState()
        let wipeY = CGFloat(sceneProgress) * CGFloat(height)
        ctx.setFillColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 0.25 * alphaB)
        ctx.fill(CGRect(x: 0, y: wipeY - 20, width: CGFloat(width), height: 40))
        ctx.restoreGState()
    }

    // 2. Procedural Animation Overlays based on Scene Index
    let time = Double(globalFrame) / Double(fps)

    if sceneIdx == 0 {
        // Scene 1: Laser eye glow pulse
        let laserGlow = 0.5 + 0.5 * sin(time * 12.0)
        ctx.saveGState()
        ctx.setBlendMode(.screen)
        ctx.setFillColor(red: 0.0, green: 1.0, blue: 0.4, alpha: CGFloat(laserGlow * 0.4))
        ctx.fillEllipse(in: CGRect(x: width/2 - 100, y: 950, width: 200, height: 100))
        ctx.restoreGState()
    } else if sceneIdx == 1 {
        // Scene 2: Terminal blip / typing indicator
        let blip = (globalFrame % 10 < 5)
        if blip {
            ctx.saveGState()
            ctx.setFillColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 0.8)
            ctx.fill(CGRect(x: 105, y: 170, width: 14, height: 26))
            ctx.restoreGState()
        }
    } else if sceneIdx == 2 {
        // Scene 3: Metallic Shimmer Bar sweeping down
        let sweepY = CGFloat(fmod(time * 600.0, Double(height)))
        ctx.saveGState()
        ctx.setBlendMode(.screen)
        ctx.setFillColor(red: 1.0, green: 0.85, blue: 0.0, alpha: 0.2)
        ctx.fill(CGRect(x: 0, y: sweepY, width: CGFloat(width), height: 35))
        ctx.restoreGState()
    } else if sceneIdx == 3 {
        // Scene 4: Rising rocket thruster particles
        ctx.saveGState()
        ctx.setBlendMode(.screen)
        for i in 0..<12 {
            let px = 180 + (i % 4) * 220 + Int(sin(Double(globalFrame + i * 15)) * 15.0)
            let py = 1500 - Int(fmod(Double(globalFrame * 12 + i * 40), 500.0))
            let pSize = CGFloat(4 + (i % 6))
            ctx.setFillColor(red: 0.0, green: 1.0, blue: 0.4, alpha: 0.7)
            ctx.fill(CGRect(x: CGFloat(px), y: CGFloat(py), width: pSize, height: pSize))
        }
        ctx.restoreGState()
    } else if sceneIdx == 4 {
        // Scene 5: Boop expanding neon ripple rings
        let ripplePhase = fmod(time * 2.0, 1.0)
        let radius = CGFloat(ripplePhase * 400.0)
        let alpha = CGFloat(max(0.0, 1.0 - ripplePhase))
        ctx.saveGState()
        ctx.setLineWidth(4.0)
        ctx.setStrokeColor(red: 0.0, green: 1.0, blue: 0.4, alpha: alpha)
        ctx.strokeEllipse(in: CGRect(x: CGFloat(width/2) - radius, y: 1250 - radius, width: radius * 2, height: radius * 2))
        ctx.restoreGState()
    }

    // 3. Subtle Animated Neon Border
    ctx.saveGState()
    let borderAlpha = 0.6 + 0.3 * sin(time * 5.0)
    ctx.setLineWidth(6.0)
    ctx.setStrokeColor(red: 0.0, green: 1.0, blue: 0.4, alpha: CGFloat(borderAlpha))
    ctx.stroke(CGRect(x: 15, y: 15, width: width - 30, height: height - 30))
    ctx.restoreGState()

    ctx.restoreGState()
    return buffer
}

// 3. Render and Write All Frames
var currentFrame = 0
var sceneCumulativeStart = 0

print("Compiling \(totalFrames) vertical frames (30fps, 1080x1920)...")

for sceneIdx in 0..<sceneDurations.count {
    let dur = sceneDurations[sceneIdx]
    let sFrames = Int(dur * Double(fps))
    let imgA = sceneImages[sceneIdx]
    let nextIdx = (sceneIdx + 1 < sceneImages.count) ? (sceneIdx + 1) : nil
    let imgB = (nextIdx != nil) ? sceneImages[nextIdx!] : nil

    for f in 0..<sFrames {
        let globalF = sceneCumulativeStart + f
        if globalF >= totalFrames { break }

        let sProgress = Double(f) / Double(sFrames)
        var alphaB: CGFloat = 0.0

        if nextIdx != nil && f >= (sFrames - transitionFrames) {
            let tProgress = Double(f - (sFrames - transitionFrames)) / Double(transitionFrames)
            alphaB = CGFloat(min(max(tProgress, 0.0), 1.0))
        }

        while !writerInput.isReadyForMoreMediaData {
            usleep(1000)
        }

        guard let pxBuf = renderFramePixelBuffer(
            sceneIdx: sceneIdx,
            imgA: imgA,
            imgB: imgB,
            alphaB: alphaB,
            sceneProgress: sProgress,
            globalFrame: globalF
        ) else {
            print("Failed to render buffer at frame \(globalF)")
            exit(1)
        }

        let timeVal = CMTime(value: CMTimeValue(globalF), timescale: fps)
        adaptor.append(pxBuf, withPresentationTime: timeVal)

        if globalF % 90 == 0 {
            let pct = Int((Double(globalF) / Double(totalFrames)) * 100)
            print("Progress: \(pct)% (Frame \(globalF)/\(totalFrames))")
        }
    }
    sceneCumulativeStart += sFrames
}

writerInput.markAsFinished()

let group = DispatchGroup()
group.enter()
writer.finishWriting {
    print("Video track finished writing!")
    group.leave()
}
group.wait()

// 4. Mux with Audio using AVMutableComposition
print("Muxing high-quality 48kHz audio track...")
let composition = AVMutableComposition()
let videoAsset = AVURLAsset(url: tempUrl)
let audioAsset = AVURLAsset(url: URL(fileURLWithPath: audioPath))

guard let compVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
      let srcVideoTrack = videoAsset.tracks(withMediaType: .video).first else {
    print("Error: Could not setup composition video track")
    exit(1)
}

let clipDuration = CMTime(seconds: totalSeconds, preferredTimescale: 600)
let clipRange = CMTimeRange(start: .zero, duration: clipDuration)

do {
    try compVideoTrack.insertTimeRange(clipRange, of: srcVideoTrack, at: .zero)
} catch {
    print("Error inserting video track: \(error)")
    exit(1)
}

if let compAudioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid),
   let srcAudioTrack = audioAsset.tracks(withMediaType: .audio).first {
    let audioDuration = min(clipDuration, audioAsset.duration)
    let audioRange = CMTimeRange(start: .zero, duration: audioDuration)
    do {
        try compAudioTrack.insertTimeRange(audioRange, of: srcAudioTrack, at: .zero)
        print("Audio track inserted successfully!")
    } catch {
        print("Warning: Could not insert audio track: \(error)")
    }
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
        print("SUCCESS! Final 9:16 Video Short created at \(finalVideoPath)")
    } else {
        print("Export failed: \(String(describing: exportSession.error))")
    }
    exportGroup.leave()
}
exportGroup.wait()

// Copy to Downloads & Artifact directory
try? FileManager.default.copyItem(atPath: finalVideoPath, toPath: downloadsVideoPath)
try? FileManager.default.copyItem(atPath: finalVideoPath, toPath: artifactVideoPath)
print("Copied final video to:")
print(" - \(downloadsVideoPath)")
print(" - \(artifactVideoPath)")
