import test from 'node:test';
import assert from 'node:assert/strict';
import {articles,categories,quizzes,timeline} from '../src/content.js';

test('twelve original articles have 700–1,000 words, distinct IDs, source links, cover alt text, and copy',()=>{
  assert.equal(articles.length,12);
  assert.equal(new Set(articles.map(a=>a.id)).size,12);
  for(const a of articles){const words=a.body.join(' ').split(/\s+/).filter(Boolean).length;assert.ok(words>=700&&words<=1000,`${a.id}: ${words} words`);assert.ok(a.sources.length,a.id);assert.ok(a.sources.every(s=>/^https:\/\//.test(s[1])),a.id);assert.ok(a.alt,a.id);assert.ok(a.tags.length,a.id)}
});
test('category archive contains every article category',()=>{
  for(const a of articles)assert.ok(categories.includes(a.category));
});
test('short and long quizzes have 5 and 10 valid, explained answers',()=>{
  assert.equal(quizzes.short.length,5);assert.equal(quizzes.long.length,10);
  for(const q of [...quizzes.short,...quizzes.long]){assert.equal(q.a.length,4);assert.ok(q.correct>=0&&q.correct<q.a.length);assert.ok(q.why.length>15)}
});
test('timeline events have a source and chronological order',()=>{
  assert.ok(timeline.length>=8);assert.ok(timeline.every(x=>/^https:\/\//.test(x.url)));
  const years=timeline.map(x=>Number(x.year));assert.deepEqual(years,[...years].sort((a,b)=>a-b));
});
