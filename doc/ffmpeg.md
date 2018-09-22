Commands

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
