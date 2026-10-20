import os from 'node:os'
import fs from 'node:fs'
import { app } from 'electron'
import type { ResourceSnapshot, SystemInfo } from '@shared/api-contract'

interface CpuSnapshot {
  idle: number
  total: number
}

let lastCpu: CpuSnapshot | null = null

function snapshotCpu(): CpuSnapshot {
  const cpus = os.cpus()
  let idle = 0
  let total = 0
  for (const cpu of cpus) {
    const t = cpu.times
    idle += t.idle
    total += t.user + t.nice + t.sys + t.idle + t.irq
  }
  return { idle, total }
}

function computeCpuPercent(): number {
  const now = snapshotCpu()
  if (!lastCpu) {
    lastCpu = now
    return 0
  }
  const idleDiff = now.idle - lastCpu.idle
  const totalDiff = now.total - lastCpu.total
  lastCpu = now
  if (totalDiff <= 0) return 0
  const busy = 1 - idleDiff / totalDiff
  return Math.max(0, Math.min(100, busy * 100))
}

function readDiskStats(): { free: number; total: number } {
  try {
    const root = process.platform === 'win32' ? 'C:\\' : '/'
    const stats = fs.statfsSync(root)
    return {
      free: Number(stats.bavail) * Number(stats.bsize),
      total: Number(stats.blocks) * Number(stats.bsize)
    }
  } catch {
    return { free: 0, total: 0 }
  }
}

export function getSystemInfo(): SystemInfo {
  const cpus = os.cpus()
  const disk = readDiskStats()
  const firstCpu = cpus[0]
  return {
    os: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    appVersion: app.getVersion(),
    totalMemoryBytes: os.totalmem(),
    cpuModel: firstCpu?.model ?? 'Unknown CPU',
    cpuCores: cpus.length,
    diskFreeBytes: disk.free,
    diskTotalBytes: disk.total
  }
}

export function getResourceSnapshot(): ResourceSnapshot {
  const total = os.totalmem()
  const free = os.freemem()
  return {
    cpuPercent: computeCpuPercent(),
    usedMemoryBytes: total - free,
    totalMemoryBytes: total,
    timestamp: Date.now()
  }
}