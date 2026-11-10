import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {articles} from '../src/content.js';
const base='/offcourt/';
const site=(process.env.VITE_SITE_URL||'').replace(/\/$/,'');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let root=await readFile('dist/index.html','utf8');
if(site){root=root.replace('</head>',`<link rel="canonical" href="${site}/"><script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:'OffCourt',url:`${site}/`,description:'Türkçe spor markaları ve spor kültürü dijital dergisi.'})}</script></head>`)}
const urls=[];
for(const a of articles){
  const href=`${base}articles/${a.id}/`;
  const canonical=site?`${site}/articles/${a.id}/`:'';
  const body=a.body.map((p,i)=>`<p${i===0?' class="lead"':''}>${escape(p)}</p>`).join('');
  const metadata={"@context":"https://schema.org","@type":"Article",headline:a.title,description:a.deck,datePublished:a.date,author:{"@type":"Organization",name:'OffCourt'},publisher:{"@type":"Organization",name:'OffCourt'},image:`https://images.unsplash.com/${a.image}?auto=format&fit=crop&w=1400&q=82`,keywords:a.tags.join(', '),mainEntityOfPage:canonical||href};
  const crumbs={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:'OffCourt',item:site?`${site}/`:`${base}`},{"@type":"ListItem",position:2,name:a.category,item:site?`${site}/#stories`:`${base}#stories`},{"@type":"ListItem",position:3,name:a.title}]};
  const staticContent=`<main><article><nav aria-label="Breadcrumb"><a href="${base}">OffCourt</a> / <a href="${base}#stories">${escape(a.category)}</a></nav><p>${escape(a.brand)} · ${a.read} dk okuma</p><h1>${escape(a.title)}</h1><p>${escape(a.deck)}</p><img src="https://images.unsplash.com/${a.image}?auto=format&amp;fit=crop&amp;w=1400&amp;q=82" alt="${escape(a.alt)}"><div>${body}</div><h2>Kaynaklar</h2><ul>${a.sources.map(s=>`<li><a href="${escape(s[1])}">${escape(s[0])}</a></li>`).join('')}</ul><a href="${base}#article/${a.id}">Hikâyeyi etkileşimli görün</a></article></main>`;
  const page=root.replace('<title>OffCourt — The Story Behind the Game</title>',`<title>${escape(a.title)} — OffCourt</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(a.deck)}">`).replace('<meta property="og:type" content="website" />','<meta property="og:type" content="article" />').replace('<meta property="og:title" content="OffCourt — The Story Behind the Game" />',`<meta property="og:title" content="${escape(a.title)} — OffCourt" />`).replace('<meta property="og:description" content="Spor markalarının ardındaki hikâyeleri keşfet." />',`<meta property="og:description" content="${escape(a.deck)}" />`).replace(/<meta property="og:image"[^>]*>/,`<meta property="og:image" content="https://images.unsplash.com/${a.image}?auto=format&amp;fit=crop&amp;w=1400&amp;q=82" />`).replace('</head>',`${canonical?`<link rel="canonical" href="${canonical}">`:''}<script type="application/ld+json">${JSON.stringify(metadata)}</script><script type="application/ld+json">${JSON.stringify(crumbs)}</script></head>`).replace('<div id="app"></div>',`<div id="app">${staticContent}</div>`);
  const target=`dist/articles/${a.id}`;await mkdir(target,{recursive:true});await writeFile(`${target}/index.html`,page);if(canonical)urls.push(`<url><loc>${canonical}</loc><lastmod>${a.date}</lastmod></url>`);
}
const homeCanonical=site?`${site}/`:'';
await writeFile('dist/index.html',root);
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n'+(site?`Sitemap: ${site}/sitemap.xml\n`:''));
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${homeCanonical?`<url><loc>${homeCanonical}</loc></url>`:''}${urls.join('')}</urlset>`);
