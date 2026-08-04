"use client";

import type { RetrievalRun } from "@/lib/types";
import { resolveChunk as getChunk } from "@/lib/chunkRegistry";
import { chunkKeyOf, type ChunkKey } from "./chunkKeys";

const WIDTH = 700;
const COL_X = [120, 280, 440, 600];
const AXIS_X = 30;
const Y0 = 58;
const ROW_H = 26;

/** Vị trí của một chunk ở một tầng: rank hoặc null nếu tầng đó không trả về nó. */
interface FlowPoint {
  x: number;
  y: number;
  rank: number | null;
}

function curve(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string {
  const dx = (b.x - a.x) * 0.42;
  return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

/**
 * Biểu đồ đổi hạng (bump chart) tự vẽ bằng SVG — không dùng thư viện chart.
 * Mỗi chunk là một đường; đường đứt nghĩa là chunk không có mặt ở tầng đó.
 */
export function RankFlowChart({
  run,
  keys,
  active,
  onActive,
}: {
  run: RetrievalRun;
  keys: Map<string, ChunkKey>;
  active: string | null;
  onActive: (chunkId: string | null) => void;
}) {
  const maxRank = Math.max(...run.stages.map((s) => s.items.length), 1);
  const absentY = Y0 + maxRank * ROW_H;
  const height = absentY + 34;

  const rankMaps = run.stages.map(
    (stage) => new Map(stage.items.map((item) => [item.chunkId, item.rank])),
  );

  const chunkIds = [...keys.keys()];

  return (
    <div className="overflow-x-auto scrollbar-slim">
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="h-auto w-full min-w-[38rem]"
        role="img"
        aria-label={`Biểu đồ đổi hạng của ${chunkIds.length} chunk qua bốn tầng truy xuất`}
      >
        {/* Lưới ngang theo hạng */}
        {Array.from({ length: maxRank }, (_, i) => {
          const y = Y0 + i * ROW_H;
          return (
            <g key={`row-${i}`}>
              <line
                x1={AXIS_X + 12}
                x2={WIDTH - 26}
                y1={y}
                y2={y}
                className="stroke-border"
                strokeWidth={1}
                strokeDasharray="2 4"
                opacity={0.7}
              />
              <text
                x={AXIS_X}
                y={y + 3.5}
                textAnchor="end"
                className="fill-fg-subtle font-mono text-[10px]"
              >
                #{i + 1}
              </text>
            </g>
          );
        })}
        <text
          x={AXIS_X}
          y={absentY + 3.5}
          textAnchor="end"
          className="fill-fg-subtle font-mono text-[10px]"
        >
          —
        </text>

        {/* Nhãn từng tầng */}
        {run.stages.map((stage, i) => (
          <g key={stage.key}>
            <line
              x1={COL_X[i]}
              x2={COL_X[i]}
              y1={Y0 - 16}
              y2={absentY + 14}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={COL_X[i]}
              y={24}
              textAnchor="middle"
              className="fill-fg text-[12px] font-semibold"
            >
              {stage.title}
            </text>
            <text
              x={COL_X[i]}
              y={38}
              textAnchor="middle"
              className="fill-fg-subtle font-mono text-[10px]"
            >
              {stage.scoreName}
            </text>
          </g>
        ))}

        {/* Một nhóm cho mỗi chunk: đường nối + chấm + chữ cái */}
        {chunkIds.map((chunkId) => {
          const key = chunkKeyOf(keys, chunkId);
          const chunk = getChunk(chunkId);
          const points: FlowPoint[] = rankMaps.map((map, i) => {
            const rank = map.get(chunkId) ?? null;
            return {
              x: COL_X[i],
              y: rank === null ? absentY : Y0 + (rank - 1) * ROW_H,
              rank,
            };
          });

          const dimmed = active !== null && active !== chunkId;
          const focused = active === chunkId;
          const lastPresent = [...points].reverse().find((p) => p.rank !== null);
          const labelPoint = lastPresent ?? points[points.length - 1];

          return (
            <g
              key={chunkId}
              opacity={dimmed ? 0.14 : 1}
              onMouseEnter={() => onActive(chunkId)}
              onMouseLeave={() => onActive(null)}
              style={{ cursor: "pointer", transition: "opacity 150ms" }}
            >
              <title>
                {`${key.letter} · ${chunkId}${chunk ? ` — ${chunk.section}` : ""}: ` +
                  run.stages
                    .map(
                      (stage, i) =>
                        `${stage.title} ${
                          points[i].rank === null ? "không có" : `#${points[i].rank}`
                        }`,
                    )
                    .join(", ")}
              </title>

              {points.slice(0, -1).map((point, i) => {
                const next = points[i + 1];
                const broken = point.rank === null || next.rank === null;
                return (
                  <g key={`${chunkId}-seg-${i}`}>
                    <path
                      d={curve(point, next)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                    />
                    <path
                      d={curve(point, next)}
                      fill="none"
                      stroke={key.color}
                      strokeWidth={focused ? 3 : 1.8}
                      strokeDasharray={broken ? "4 4" : undefined}
                      opacity={broken ? 0.55 : 0.9}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {points.map((point, i) =>
                point.rank === null ? (
                  <circle
                    key={`${chunkId}-dot-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r={3}
                    className="fill-surface"
                    stroke={key.color}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                ) : (
                  <circle
                    key={`${chunkId}-dot-${i}`}
                    cx={point.x}
                    cy={point.y}
                    r={focused ? 5.5 : 4}
                    fill={key.color}
                  />
                ),
              )}

              <text
                x={labelPoint.x + 13}
                y={labelPoint.y + 3.5}
                className="font-mono text-[10px] font-semibold"
                fill={key.color}
              >
                {key.letter}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
