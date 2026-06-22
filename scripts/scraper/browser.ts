import puppeteer, { Browser, Page } from "puppeteer"
import { ScraperConfig } from "./types"

export class BrowserPool {
  private browser: Browser | null = null
  private pages: Page[] = []
  private config: ScraperConfig

  constructor(config: ScraperConfig) {
    this.config = config
  }

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--single-process",
        ],
      })
    }
  }

  async getPage(): Promise<Page> {
    if (!this.browser) throw new Error("Browser not initialized")
    // Reuse existing pages if available
    while (this.pages.length > 0) {
      const p = this.pages.pop()!
      try {
        await p.evaluate(() => 1) // check if still alive
        return p
      } catch {
        // page is dead, discard
      }
    }
    return await this.browser.newPage()
  }

  releasePage(page: Page): void {
    this.pages.push(page)
  }

  async close(): Promise<void> {
    for (const p of this.pages) {
      try { await p.close() } catch {}
    }
    this.pages = []
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export function randomDelay(base: number): Promise<void> {
  return delay(base + Math.random() * base * 0.5)
}
