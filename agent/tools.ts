import { load as loadHtml } from "cheerio";
import { request } from "undici";
import Database from "better-sqlite3";
import type { ToolFn } from "./types.js";

const db = new Database(process.env.HYDRA_DB ?? "./hydraflow.db");

function ensureNotes() {
  db.prepare(`CREATE TABLE IF NOT EXISTS notes(
    id INTEGER PRIMARY KEY,
    title TEXT,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`).run();
}

export const web_search: ToolFn = async (args) => {
  const q = String(args.q ?? "").trim();
  if (!q) {
    return [];
  }
  const k = Number(args.k ?? 5) || 5;
  const params = new URLSearchParams({ q });
  const { body } = await request("https://duckduckgo.com/html/", {
    method: "POST",
    body: params,
  });
  const html = await body.text();
  const $ = loadHtml(html);
  const out: { title: string; url: string }[] = [];
  $(".result__a")
    .slice(0, k)
    .each((_, anchor) => {
      const url = $(anchor).attr("href");
      const title = $(anchor).text().trim();
      if (url && title) {
        out.push({ title, url });
      }
    });
  return out;
};

export const fetch_page: ToolFn = async (args) => {
  const url = String(args.url ?? "");
  if (!url) {
    throw new Error("url is required");
  }
  const maxChars = Number(args.maxChars ?? 4000) || 4000;
  const { body } = await request(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });
  let text = await body.text();
  const $ = loadHtml(text);
  $("script,style,noscript").remove();
  text = $("body").text().replace(/\s+/g, " ").trim();
  return text.slice(0, maxChars);
};

export const save_note: ToolFn = async (args) => {
  ensureNotes();
  const title = String(args.title ?? "Note");
  const content = String(args.content ?? "");
  const stmt = db.prepare("INSERT INTO notes(title, content) VALUES(?, ?)");
  const info = stmt.run(title, content);
  return { ok: true, id: info.lastInsertRowid };
};
