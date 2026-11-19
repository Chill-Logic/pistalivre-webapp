import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Audio } from "@/components/atoms/audio";
import { Box } from "@/components/atoms/box";
import { Button } from "@/components/atoms/button";
import { SeekBar } from "@/components/atoms/seek-bar";
import { Spinner } from "@/components/atoms/spinner";
import { Text } from "@/components/atoms/text";
import { useFileObjectUrl } from "@/hooks/api/comum/files/useFileObjectUrl";
import type { FileLink } from "@/types/document";
import { cn } from "@/utils/cn";

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

type AudioPlayerProps = {
  file: FileLink;
  className?: string;
};

/**
 * Plays an audio attachment right on the page: play/pause, a bar to jump and
 * the time (our controls, not the browser's). The file is only downloaded on
 * the first play. The server stores audio as MP3, which every browser plays.
 */
export function AudioPlayer({ file, className }: AudioPlayerProps) {
  const ref = useRef<HTMLAudioElement>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const source = useFileObjectUrl(requested ? file : null);

  useEffect(() => {
    if (!source.isError) return;
    toast.error("Não deu para carregar o áudio");
    setRequested(false);
  }, [source.isError]);

  const play = () =>
    ref.current
      ?.play()
      .catch(() =>
        toast.error("Este navegador não tocou o áudio: baixe o arquivo"),
      );

  // First play: start as soon as the file arrives.
  useEffect(() => {
    if (source.url) void play();
  }, [source.url]);

  const toggle = () => {
    if (!source.url) return setRequested(true);
    if (ref.current?.paused) void play();
    else ref.current?.pause();
  };

  const loading = requested && !source.url && !source.isError;
  return (
    <Box className={cn("flex min-w-0 items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={toggle}
        disabled={loading}
        aria-label={`${playing ? "Pausar" : "Ouvir"} ${file.fileName}`}
      >
        {loading ? <Spinner /> : playing ? <Pause /> : <Play />}
      </Button>
      <SeekBar
        className="min-w-16 flex-1"
        value={duration ? time / duration : 0}
        disabled={!source.url}
        label={`Posição em ${file.fileName}`}
        valueText={`${clock(time)} de ${clock(duration)}`}
        onSeek={(ratio) => {
          if (ref.current && duration)
            ref.current.currentTime = ratio * duration;
        }}
      />
      <Text size="xs" tone="muted" className="shrink-0 tabular-nums">
        {source.url ? `${clock(time)} / ${clock(duration)}` : "Áudio"}
      </Text>
      {source.url && (
        <Audio
          ref={ref}
          src={source.url}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setTime(0);
          }}
          onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) =>
            setDuration(event.currentTarget.duration)
          }
          onDurationChange={(event) =>
            setDuration(event.currentTarget.duration)
          }
        />
      )}
    </Box>
  );
}
