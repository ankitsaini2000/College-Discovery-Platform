import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync } from "fs"
import { join } from "path"

export class DiskCache {
  private dir: string

  constructor(subdir: string) {
    this.dir = join(__dirname, "data", subdir)
    if (!existsSync(this.dir)) {
      mkdirSync(this.dir, { recursive: true })
    }
  }

  key(k: string): string {
    return join(this.dir, `${k.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`)
  }

  has(k: string): boolean {
    return existsSync(this.key(k))
  }

  get<T>(k: string): T | null {
    const path = this.key(k)
    if (!existsSync(path)) return null
    try {
      return JSON.parse(readFileSync(path, "utf-8"))
    } catch {
      return null
    }
  }

  set(k: string, data: unknown): void {
    writeFileSync(this.key(k), JSON.stringify(data, null, 2), "utf-8")
  }

  list(): string[] {
    if (!existsSync(this.dir)) return []
    return readdirSync(this.dir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""))
  }

  clear(): void {
    for (const f of this.list()) {
      try { const fs = require("fs"); fs.unlinkSync(this.key(f)) } catch {}
    }
  }

  progressPath(): string {
    return join(this.dir, "__progress__.json")
  }

  saveProgress(state: Record<string, unknown>): void {
    writeFileSync(this.progressPath(), JSON.stringify(state, null, 2))
  }

  loadProgress(): Record<string, unknown> | null {
    const p = this.progressPath()
    if (!existsSync(p)) return null
    try { return JSON.parse(readFileSync(p, "utf-8")) } catch { return null }
  }
}
