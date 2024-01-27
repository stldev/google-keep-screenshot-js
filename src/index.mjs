import { readFileSync, rmSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from 'url';
import { execSync } from "node:child_process";
import puppeteer from "puppeteer";
import { emailTo1, emailTo2, emailUser, emailPass } from "./config.mjs";

// const MINUTES_2 = 120_000; // FOR_TESTING

const googleKeepUrl = 'https://keep.google.com/';
const picPathRoot = './pics'
const cookiesPath = './cookies.json';

async function getNewCookiesToSave() {
  await page.waitForNavigation()
  await page.waitForSelector('input[type="email"]')
  await page.click('input[type="email"]')
  await page.type('input[type="email"]', 'YOUR_EMAIL_HERE') // TODO : change to your email 
  await page.waitForSelector('#identifierNext')
  await page.click('#identifierNext')
  await new Promise((resolve) => setTimeout(resolve, 999));
  await page.waitForSelector('input[type="password"]')
  await page.click('input[type="password"]')
  await new Promise((resolve) => setTimeout(resolve, 999));
  await page.type('input[type="password"]', 'YOUR_PWD_HERE') // TODO : change to your password
  await page.waitForSelector('#passwordNext')
  await page.click('#passwordNext')
  await page.waitForNavigation()
  await new Promise((resolve) => setTimeout(resolve, 25000));
  const cookies = await page.cookies();
  await writeFileSync('./cookies.json', JSON.stringify(cookies, null, 2));
}

async function start() {
  console.time("TIME_TAKEN");

  if (existsSync(picPathRoot)) rmSync(picPathRoot, { force: true, recursive: true });
  mkdirSync(picPathRoot)

  const browser = await puppeteer.launch({ headless: 'new' });
  // const browser = await puppeteer.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 700, height: 700 });

  const cookiesString = await readFileSync(cookiesPath);
  const cookies = JSON.parse(cookiesString);
  await page.setCookie(...cookies);

  await page.goto(googleKeepUrl);

  // await getNewCookiesToSave(); // Only need this if creds go stale

  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.click('[aria-label="Main menu"]')
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const fileName = new Date().toISOString().split('.')[0].replaceAll(':', '_');
  const path = `${picPathRoot}/pic-${fileName}.png`;

  await page.screenshot({
    path,
    type: "png",
    clip: { x: 0, y: 0, width: 700, height: 900 }
  });
  await browser.close();

  const scriptPath = fileURLToPath(import.meta.url).replace('index.mjs', 'send-email.ps1');
  const picPath = fileURLToPath(import.meta.url).replace('src\\index.mjs', `pics\\pic-${fileName}.png`);
  // Expect picPath to be like = C:\_CODE\_STLDEV\google-keep-screenshot\pics\pic-2024-01-27T18_19_13.png

  const scriptArgs1 = `-emailto "${emailTo1}" -emailuser "${emailUser}" -emailpass "${emailPass}" -picPath "${picPath}"`;

  execSync(`${scriptPath} ${scriptArgs1}`, {
    stdio: "inherit",
    encoding: "utf-8",
    shell: "powershell",
  });

  const scriptArgs2 = `-emailto "${emailTo2}" -emailuser "${emailUser}" -emailpass "${emailPass}" -picPath "${picPath}"`;

  execSync(`${scriptPath} ${scriptArgs2}`, {
    stdio: "inherit",
    encoding: "utf-8",
    shell: "powershell",
  });

  console.timeEnd("TIME_TAKEN");
}

start();

// setInterval(() => {
//   start();
// }, MINUTES_2);
