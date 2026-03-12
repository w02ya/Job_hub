import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { chromium } from "playwright";
import { scrapeWanted } from "./src/lib/scraper/wanted";
import { scrapeSaramin } from "./src/lib/scraper/saramin";
import { scrapeJobkorea } from "./src/lib/scraper/jobkorea";
import { scrapeRocketpunch } from "./src/lib/scraper/rocketpunch";
import { scrapeJobplanet } from "./src/lib/scraper/jobplanet";
import { scrapeLinkareer } from "./src/lib/scraper/linkareer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 원티드 크롤링 API
  app.get("/api/scrape/wanted", async (req, res) => {
    const { category = "873" } = req.query; // 873: 프론트엔드, 872: 백엔드
    const url = `https://www.wanted.co.kr/wdlist/518/${category}`;
    
    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      const context = await browser.newContext({
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport: { width: 1280, height: 800 }
      });
      
      const page = await context.newPage();
      
      // 1. 페이지 이동 및 대기
      console.log(`Navigating to ${url}...`);
      await page.goto(url, { waitUntil: "networkidle" });
      
      // 공고 리스트가 나타날 때까지 대기
      const listSelector = 'ul[data-cy="job-list"]';
      await page.waitForSelector(listSelector, { timeout: 10000 });

      // 2. 무한 스크롤 처리 (예시로 3번 스크롤)
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
        await page.waitForTimeout(1500 + Math.random() * 1000); // 사람처럼 보이게 랜덤 딜레이
      }

      // 3. 데이터 추출
      const jobs = await page.evaluate((platformName) => {
        const items = document.querySelectorAll('li[data-cy="job-card"]');
        return Array.from(items).map((item) => {
          const linkElement = item.querySelector('a');
          const titleElement = item.querySelector('strong.JobCard_title__HBpZf');
          const companyElement = item.querySelector('span.JobCard_companyName__N1_vH');
          const locationElement = item.querySelector('span.JobCard_location__2_Z8f');
          
          const url = linkElement ? "https://www.wanted.co.kr" + linkElement.getAttribute('href') : "";
          const id = url.split('/').pop() || Math.random().toString(36).substr(2, 9);

          return {
            id: `wanted-${id}`,
            platform: platformName,
            company: companyElement?.textContent?.trim() || "Unknown",
            title: titleElement?.textContent?.trim() || "No Title",
            location: locationElement?.textContent?.trim() || "Unknown",
            experience: "경력 확인 필요", // 상세 페이지 진입 필요하므로 리스트에선 기본값
            techStacks: [], // 리스트 페이지에선 노출되지 않는 경우가 많음
            url: url,
            deadline: "상시채용",
            postedAt: new Date().toISOString().split('T')[0]
          };
        });
      }, "원티드");

      await browser.close();
      
      res.json({
        success: true,
        data: jobs,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Scraping error:", error);
      if (browser) await browser.close();
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // ── 6개 플랫폼 통합 크롤링 API ─────────────────────────────
  app.get("/api/jobs", async (req, res) => {
    const { category = "873", platforms } = req.query;
    const requestedPlatforms = platforms
      ? String(platforms).split(",")
      : ["원티드", "사람인", "잡코리아", "로켓펀치", "잡플래닛", "링커리어"];

    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        executablePath: process.env.CHROMIUM_PATH || undefined,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });

      const scrapers: { name: string; fn: () => Promise<any[]> }[] = [
        { name: "원티드",   fn: () => scrapeWanted(browser!, String(category)) },
        { name: "사람인",   fn: () => scrapeSaramin(browser!) },
        { name: "잡코리아", fn: () => scrapeJobkorea(browser!) },
        { name: "로켓펀치", fn: () => scrapeRocketpunch(browser!) },
        { name: "잡플래닛", fn: () => scrapeJobplanet(browser!) },
        { name: "링커리어", fn: () => scrapeLinkareer(browser!) },
      ].filter((s) => requestedPlatforms.includes(s.name));

      const results = await Promise.allSettled(scrapers.map((s) => s.fn()));

      const jobs: any[] = [];
      const errors: string[] = [];

      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          jobs.push(...result.value);
        } else {
          const name = scrapers[i].name;
          const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
          console.error(`[${name}] 실패:`, msg);
          errors.push(`${name}: ${msg}`);
        }
      });

      await browser.close();

      res.json({
        success: true,
        data: jobs,
        errors: errors.length ? errors : undefined,
        count: jobs.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("API /api/jobs 오류:", error);
      if (browser) await browser.close();
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
