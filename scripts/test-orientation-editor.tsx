import { createRequire } from "node:module";
import assert from 'node:assert/strict';
import React, { useState } from 'react';
import OrientationQuizEditor from '../src/components/nho/OrientationQuizEditor';
import { INITIAL_ORIENTATION_DECK_CONFIG, validateOrientationDeckConfig } from '../src/components/nho/nhoInitialData';
import type { NHOOrientationDeckConfig } from '../src/components/nho/nhoTypes';

const loadPackage = createRequire(process.env.SIBS_ORIENTATION_TEST_PACKAGE || process.cwd() + '/package.json');
const { JSDOM } = loadPackage('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url: 'http://localhost'});
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, Node: dom.window.Node });
const { render, fireEvent, cleanup } = loadPackage('@testing-library/react');
let draft: NHOOrientationDeckConfig;
function Harness() {
  const [config, setConfig] = useState(structuredClone(INITIAL_ORIENTATION_DECK_CONFIG));
  draft = config;
  return <OrientationQuizEditor config={config} onChange={setConfig} />;
}
const ui = render(<Harness />);
fireEvent.change(ui.getByLabelText('Part title'), {target: {value: 'Part 1: Introduction'}});
fireEvent.change(ui.getByLabelText('Show this part’s quiz after slide'), {target: {value: '2'}});
assert.equal(draft!.quizStages![0].triggerAfterSlide, 2);
fireEvent.change(ui.getByLabelText('Number of questions in this part'), {target: {value: '2'}});
assert.equal(ui.getAllByLabelText('Question text').length, 2);
assert.ok(validateOrientationDeckConfig(draft!).some(e => e.includes('question text')));
fireEvent.change(ui.getAllByLabelText('Question text')[1], {target: {value: 'Who can help with onboarding?'}});
for (const [i, answer] of ['HR', 'A stranger', 'Nobody', 'A vendor'].entries()) {
  fireEvent.change(ui.getByLabelText(`Question 2: answer ${String.fromCharCode(65 + i)}`), {target: {value: answer}});
}
fireEvent.click(ui.getByLabelText('Question 2: option A is correct'));
assert.equal(draft!.quizQuestions!.at(-1)!.correctOptionIndex, 0);
assert.deepEqual(validateOrientationDeckConfig(draft!), []);
fireEvent.change(ui.getByLabelText('Move question 2 to part'), {target: {value: '2'}});
assert.equal(draft!.quizStages![0].questionCount, 1);
assert.equal(draft!.quizStages![1].questionCount, 3);
fireEvent.click(ui.getByRole('button', {name: /Part 2 After slide/}));
assert.equal(ui.getAllByLabelText('Question text').length, 3);
fireEvent.click(ui.getByLabelText('Delete question 3'));
assert.equal(draft!.quizStages![1].questionCount, 2);
assert.deepEqual(validateOrientationDeckConfig(draft!), []);
cleanup();
console.log('PASS part editor: slide placement, counts, question/choice editing, answer key, reassignment and deletion');
