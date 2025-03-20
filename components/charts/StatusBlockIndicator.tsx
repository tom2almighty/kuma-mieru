import React, { useMemo } from 'react';
import type { Heartbeat } from '@/types/monitor';
import { clsx } from 'clsx';
import { CustomTooltip } from '../ui/CustomTooltip';
import dayjs from 'dayjs';
import { PingStats } from './PingStats';
import { calculatePingStats, getStatusColor } from '../utils/charts';
import { COLOR_SYSTEM } from '../utils/colors';

interface StatusBlockIndicatorProps {
  heartbeats: Heartbeat[];
  className?: string;
  isHome?: boolean;
}

export function StatusBlockIndicator({
  heartbeats,
  className,
  isHome = true,
}: StatusBlockIndicatorProps) {
  // 获取最近的 50 个心跳数据点
  const recentHeartbeats = heartbeats.slice(-50);

  // 计算延迟动态分布
  const pingStats = useMemo(() => calculatePingStats(recentHeartbeats), [recentHeartbeats]);

  return (
    <div className={clsx(className, 'relative mt-4 flex flex-col gap-1')}>
      {/* 图例和延迟统计 */}
      <div className="absolute -top-6 flex w-full items-center justify-between">
        <PingStats heartbeats={recentHeartbeats} isHome={isHome} />
        <div
          className={clsx(
            'flex items-center gap-3 text-tiny text-foreground/80 dark:text-foreground/60',
            isHome && 'ml-auto',
          )}
        >
          {Object.entries(COLOR_SYSTEM)
            .filter(([_, value]) => value.showInLegend)
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={clsx('w-1.5 h-1.5 rounded-full', value.bg.dark)} />
                <span>{value.label}</span>
              </div>
            ))}
        </div>
      </div>

      {/* 状态块 */}
      <div className="flex gap-0.5 h-3 w-full rounded-sm overflow-hidden bg-default-100 dark:bg-default-50">
        {heartbeats.map((hb) => {
          const colorInfo = getStatusColor(hb, pingStats);
          return (
            <CustomTooltip
              key={hb.time}
              content={
                <div className="flex w-full items-center gap-x-2">
                  <div className="flex w-full flex-col gap-y-1">
                    <div className="flex w-full items-center gap-x-1 text-small">
                      <span className={clsx('text-small font-medium', colorInfo.text)}>
                        {colorInfo.label}
                      </span>
                      <span className="text-foreground/60 dark:text-foreground/40">-</span>
                      <span className="text-foreground/60 dark:text-foreground/40">
                        {dayjs(hb.time).format('YYYY-MM-DD HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>
              }
            >
              <div
                className={clsx(
                  'flex-1 h-full cursor-pointer transition-all hover:opacity-80',
                  'dark:hover:opacity-90',
                  hb.ping ? colorInfo.bg.dark : colorInfo.bg.light,
                )}
              />
            </CustomTooltip>
          );
        })}
      </div>
    </div>
  );
}
