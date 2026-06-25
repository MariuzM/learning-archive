import puppeteer from 'puppeteer';

export type Heading = { level: number; text: string };

export const scrapeHeadings = async (url: string): Promise<Heading[]> => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return page.$$eval('h1, h2, h3', (nodes) =>
      nodes.map((n) => ({
        level: Number(n.tagName[1]),
        text: n.textContent?.trim() ?? '',
      })),
    );
  } finally {
    await browser.close();
  }
};
