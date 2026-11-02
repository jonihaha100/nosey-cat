import Foundation
import AVFoundation
import AppKit

let outPath = "public/videos/kepo-genesis-teaser.mp4"
try? FileManager.default.removeItem(atPath: outPath)
let outUrl = URL(fileURLWithPath: outPath)

guard let writer = try? AVAssetWriter(outputURL: outUrl, fileType: .mp4) else {
    print("Error: Could not initialize AVAssetWriter")
    exit(1)
}

let width = 1920
let height = 1080
let fps: Int32 = 30

let videoSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 6_000_000,
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

// Load scenes
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

func newPixelBufferFromImages(imgA: CGImage, imgB: CGImage?, alphaB: CGFloat) -> CVPixelBuffer? {
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

    ctx.draw(imgA, in: CGRect(x: 0, y: 0, width: width, height: height))
    if let imgB = imgB, alphaB > 0 {
        ctx.setAlpha(alphaB)
        ctx.draw(imgB, in: CGRect(x: 0, y: 0, width: width, height: height))
    }

    CVPixelBufferUnlockBaseAddress(buffer, [])
    return buffer
}

// Scene durations in seconds: [8, 9, 11, 10, 10]
let sceneDurations = [8.0, 9.0, 11.0, 10.0, 10.0]
let transitionDuration = 0.5
let transitionFrames = Int(transitionDuration * Double(fps))

var currentFrame: Int64 = 0

for i in 0..<sceneImages.count {
    let img = sceneImages[i]
    let nextImg = (i < sceneImages.count - 1) ? sceneImages[i + 1] : nil
    let totalFramesForScene = Int(sceneDurations[i] * Double(fps))
    let solidFrames = (nextImg != nil) ? (totalFramesForScene - transitionFrames) : totalFramesForScene

    // Solid frames
    for _ in 0..<solidFrames {
        while !writerInput.isReadyForMoreMediaData {
            Thread.sleep(forTimeInterval: 0.005)
        }
        let time = CMTime(value: currentFrame, timescale: fps)
        if let buf = newPixelBufferFromImages(imgA: img, imgB: nil, alphaB: 0) {
            adaptor.append(buf, withPresentationTime: time)
        }
        currentFrame += 1
    }

    // Transition frames (crossfade)
    if let next = nextImg {
        for f in 0..<transitionFrames {
            while !writerInput.isReadyForMoreMediaData {
                Thread.sleep(forTimeInterval: 0.005)
            }
            let alpha = CGFloat(f) / CGFloat(transitionFrames)
            let time = CMTime(value: currentFrame, timescale: fps)
            if let buf = newPixelBufferFromImages(imgA: img, imgB: next, alphaB: alpha) {
                adaptor.append(buf, withPresentationTime: time)
            }
            currentFrame += 1
        }
    }
    print("Encoded scene \(i + 1)/\(sceneImages.count)")
}

writerInput.markAsFinished()
let group = DispatchGroup()
group.enter()
writer.finishWriting {
    print("Video successfully compiled at: \(outPath)")
    group.leave()
}
group.wait()
