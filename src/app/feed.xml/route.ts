import { blogArticles } from '@/data/blog-articles';
import { seoArticles } from '@/data/seo-articles';
import { articles } from '@/data/articles';
import { engArticles } from '@/data/eng-articles';

const allBlogArticles = [...blogArticles, ...seoArticles];

export async function GET() {
  const siteUrl = 'https://www.harchcorp.com';
  const now = new Date().toUTCString();

  const blogItems = allBlogArticles
    .map((article) => {
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/blog/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <content:encoded><![CDATA[${article.body || article.excerpt}]]></content:encoded>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${article.category}</category>
      ${(article.seoKeywords || []).map((k: string) => `<category>${k}</category>`).join('\n      ')}
      <author>press@harchcorp.com (Harch Corp)</author>
    </item>`;
    })
    .join('');

  const newsItems = articles
    .map((article) => {
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/newsroom/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/newsroom/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <content:encoded><![CDATA[${article.body || article.excerpt}]]></content:encoded>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${article.tag}</category>
      ${(article.seoKeywords || []).map((k: string) => `<category>${k}</category>`).join('\n      ')}
      <author>press@harchcorp.com (Harch Corp)</author>
    </item>`;
    })
    .join('');

  const engItems = engArticles
    .map((article) => {
      return `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${siteUrl}/engineering-blog/${article.slug}</link>
      <guid isPermaLink="true">${siteUrl}/engineering-blog/${article.slug}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <content:encoded><![CDATA[${article.body || article.excerpt}]]></content:encoded>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${article.category}</category>
      <category>Engineering</category>
      <category>${article.difficulty}</category>
      ${(article.seoKeywords || []).map((k: string) => `<category>${k}</category>`).join('\n      ')}
      <author>press@harchcorp.com (Harch Corp)</author>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
>
  <channel>
    <title>Harch Corp — Africa's Sovereign Infrastructure OS</title>
    <link>${siteUrl}</link>
    <description>Harch Corp is a Moroccan industrial conglomerate building Africa's industrial sovereignty. Carbon-Aware GPU Cloud, Renewable Energy, Cement, Technology, Mining, Agriculture, Water, Finance.</description>
    <language>en</language>
    <copyright>Copyright ${new Date().getFullYear()} Harch Corp</copyright>
    <managingEditor>press@harchcorp.com (Harch Corp)</managingEditor>
    <webMaster>press@harchcorp.com (Harch Corp)</webMaster>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <generator>Harch Corp Next.js RSS Generator</generator>
    <ttl>60</ttl>
    <image>
      <url>${siteUrl}/logo-512x512.png</url>
      <title>Harch Corp</title>
      <link>${siteUrl}</link>
      <width>512</width>
      <height>512</height>
    </image>
    ${blogItems}
    ${newsItems}
    ${engItems}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
