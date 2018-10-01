# Commands

```
ffmpeg \
  -fflags nobuffer \
  -f h264 \
  -framerate 30 \
  -i video.2018-09-30.21-05-40.h264 \
  -c:v libx264 \
  -b:v 3M \
  -profile baseline \
  -preset ultrafast \
  -tune zerolatency \
  -vsync 0 \
  -async 1 \
  -bsf:v h264_mp4toannexb \
  -x264-params keyint=15:scenecut=0 \
  -an \
  -f h264 \
  output.mp4
```

```
  ffmpeg \
    -f h264 \
    -r 30 \
    -i video.2018-09-30.21-39-15.h264 \
    -c:v libx264 \
    -codec:v copy \
    -preset ultrafast \
    -tune zerolatency \
    -vsync 0 \
    -async 1 \
    -bsf:v h264_mp4toannexb \
    -x264-params keyint=15:scenecut=0 \
    -movflags frag_keyframe+empty_moov \
    output.mp4
```

## Options

`-an` Skips the inclusion of audio streams
`-sn` Skips the inclusion of subtitle streams
`-dn` Skips the inclusion of data stream

`-*:v` Option specifically targets the video stream
`-*:a` Option specifically targets the audio stream

`-f fmt` Force the format of the input or output stream

`-bsf` Sets the bitstream filter
`-b:v 3M`   Set the video bitrate of the input or output file to 3MB/s

`-framerate 30, -r 30`
Set the video frame rate of the input or output file to 30FPS
Apparently the h264 muxer uses `-framerate`, while the others use `-r`

`-movflags frag_keyframe+empty_moov`
This is the key to making it all work! `frag_keyframe` allows fragmented output. `empty_moov` will cause output to be 100% fragmented; without this the first fragment will be muxed as a short movie (using moov) followed by the rest of the media in fragments.

## Things to try

Print the timestamp for each keyframe (might take a while):

```
ffprobe -loglevel error \
  -skip_frame nokey \
  -select_streams v:0 \
  -show_entries frame=pkt_pts_time \
  -of csv=print_section=0 udp://0.0.0.0:11111
```

Errors produced:
```
left block unavailable for requested intra mode
left block unavailable for requested intra4x4 mode -1
error while decoding MB 52 3, bytestream -7
decode_slice_headj]er error
concealing 1958 DC, 1958 AC, 1958 MV errors in I frame
no frame!
concealing 2292 DC, 2292 AC, 2292 MV errors in P frame
non-existing PPS 0 referenced
```
