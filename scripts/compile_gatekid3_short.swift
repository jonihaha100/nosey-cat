import Foundation
import AVFoundation
import CoreGraphics
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

func createPixelBufferFromCGImage(image: CGImage) -> CVPixelBuffer? {
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

    ctx.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return buffer
}

print("Appending \(totalFrames) rendered frames to video track...")

for f in 0..<totalFrames {
    let frameFile = String(format: "/tmp/story_frames/frame_%04d.png", f)
    guard let nsImg = NSImage(contentsOfFile: frameFile),
          let cg = nsImg.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("Failed to load frame \(frameFile)")
        exit(1)
    }

    while !writerInput.isReadyForMoreMediaData {
        usleep(1000)
    }

    guard let pxBuf = createPixelBufferFromCGImage(image: cg) else {
        print("Failed to create pixel buffer at frame \(f)")
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
    print("Video encoding complete!")
    group.leave()
}
group.wait()

// 2. Mux with Reference Soundtrack + Story SFX
print("Muxing audio tracks (Ref Music + Story SFX)...")
let composition = AVMutableComposition()
let videoAsset = AVURLAsset(url: tempUrl)
let musicAsset = AVURLAsset(url: URL(fileURLWithPath: refMusicPath))
let sfxAsset = AVURLAsset(url: URL(fileURLWithPath: sfxPath))

guard let compVideoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
      let srcVideoTrack = videoAsset.tracks(withMediaType: .video).first else {
    print("Error: Could not add composition video track")
    exit(1)
}

let clipDuration = CMTime(seconds: durationSec, preferredTimescale: 600)
let clipRange = CMTimeRange(start: .zero, duration: clipDuration)

do {
    try compVideoTrack.insertTimeRange(clipRange, of: srcVideoTrack, at: .zero)
} catch {
    print("Error inserting video: \(error)")
    exit(1)
}

// Add Music Track
if let compMusicTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid),
   let srcMusicTrack = musicAsset.tracks(withMediaType: .audio).first {
    let dur = min(clipDuration, musicAsset.duration)
    let mRange = CMTimeRange(start: .zero, duration: dur)
    try? compMusicTrack.insertTimeRange(mRange, of: srcMusicTrack, at: .zero)
}

// Add SFX Track
if let compSfxTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid),
   let srcSfxTrack = sfxAsset.tracks(withMediaType: .audio).first {
    let dur = min(clipDuration, sfxAsset.duration)
    let sRange = CMTimeRange(start: .zero, duration: dur)
    try? compSfxTrack.insertTimeRange(sRange, of: srcSfxTrack, at: .zero)
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
