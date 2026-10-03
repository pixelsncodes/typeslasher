import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/round-timing.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { RoundClock, foodTime, foodArc } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const clock = new RoundClock();
clock.start(100);
clock.tick(2100); assert.equal(clock.elapsed, 0); assert.equal(clock.ready, false);
clock.tick(3100); assert.equal(clock.elapsed, 0); assert.equal(clock.ready, true);
clock.tick(4100); assert.equal(clock.elapsed, 1000);
const deadline = clock.elapsed + foodTime('relaxed', 5);
clock.pause(4100); clock.tick(100_000); assert.equal(clock.elapsed, 1000);
clock.resume(100_000); clock.tick(103_000); assert.equal(clock.elapsed, 1000);
clock.tick(104_000); assert.equal(deadline - clock.elapsed, 15_000);
clock.pause(104_000); clock.resume(200_000); clock.tick(201_000); clock.pause(201_000);
clock.tick(250_000); clock.resume(250_000); clock.tick(253_000);
assert.equal(clock.elapsed, 2000, 'Interrupted countdown must never consume gameplay time');
clock.start(300_000); assert.equal(clock.elapsed, 0); assert.equal(clock.countdown, 3000);
assert.ok(foodTime('relaxed',6)>foodTime('relaxed',4));
assert.ok(foodTime('relaxed',5)>foodTime('steady',5));
assert.ok(foodTime('steady',5)>foodTime('brisk',5));
for (const aspect of [.5,1,1.8,3]) for (const lane of [-.85,0,.85]) for (let i=0;i<=100;i++) {
  const {x,y}=foodArc(i/100,lane,aspect);
  assert.ok(y>=-2.3 && y<=-.3+1e-9, 'Arc stays in vertical safe area');
  assert.ok(Math.abs(x)+1.7<=Math.max(2.1,aspect*6.3), 'Whole food fits horizontally');
}
console.log('Passed: countdown gating, long pauses, resumed/interrupted countdowns, restart, pace budgets, and bounded food arcs.');
