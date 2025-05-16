chcp 65001
ffmpeg -i 無意識.mp4 -codec: copy -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls hls\無意識.m3u8