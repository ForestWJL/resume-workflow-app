import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FILE_STACKS } from "@/config/fileStacks";
import { TrackBadge } from "./TrackBadge";
import type { TrackId } from "@/config/tracks";
import { TRACKS } from "@/config/tracks";

export function FileStackCard({ trackId }: { trackId: TrackId }) {
  const stack = FILE_STACKS[trackId];
  const track = TRACKS[trackId];
  const rows = [
    stack.formatTemplate,
    stack.contentMaster,
    stack.evidenceBank,
    stack.supportingReference,
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrackBadge trackId={trackId} />
          <CardTitle>{track.name}</CardTitle>
        </div>
        <p className="text-xs text-ink-500">{track.summary}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 border-t border-ink-100 pt-3 first:border-t-0 first:pt-0"
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500">
              {row.label}
            </span>
            <span className="font-mono text-[13px] text-ink-800">
              {row.fileName}
            </span>
            {row.note ? (
              <span className="text-xs text-ink-500">{row.note}</span>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
