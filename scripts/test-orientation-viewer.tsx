import { createRequire } from "node:module";
import assert from 'node:assert/strict';
import React from 'react';
import NHOOrientationViewer from '../src/components/nho/applicant/NHOOrientationViewer';
import { NHOProvider, useNHO } from '../src/components/nho/NHOContext';
import { INITIAL_ORIENTATION_DECK_CONFIG, INITIAL_NHO_APPLICANTS, ORIENTATION_CONFIG_STORAGE_KEY } from '../src/components/nho/nhoInitialData';

const loadPackage = createRequire(process.env.SIBS_ORIENTATION_TEST_PACKAGE || process.cwd() + '/package.json');
const { JSDOM } = loadPackage('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {url:'http://localhost'});
Object.assign(globalThis, {window:dom.window, document:dom.window.document, localStorage:dom.window.localStorage, Event:dom.window.Event, HTMLElement:dom.window.HTMLElement, Node:dom.window.Node});
const {render, fireEvent, cleanup, act} = loadPackage('@testing-library/react');
const config = structuredClone(INITIAL_ORIENTATION_DECK_CONFIG);
config.version = 'custom-four-slide-deck';
config.slides = config.slides.slice(0,4);
config.quizStages = config.quizStages!.map((s,i) => ({...s, triggerAfterSlide:i+1, questionCount:1}));
config.quizQuestions = config.quizQuestions!.slice(0,4).map((q,i) => ({...q, id:20+i, stageId:i+1, question:`Custom question ${i+1}`, options:[`Answer-${i+1}`, 'Wrong answer'], correctOptionIndex:0}));
localStorage.setItem(ORIENTATION_CONFIG_STORAGE_KEY, JSON.stringify(config));
const applicant = {...structuredClone(INITIAL_NHO_APPLICANTS[0]), orientationStatus:'Not Started', orientationCurrentSlide:1, orientationSlidesViewed:[], orientationQuizAnswers:{}, orientationAcknowledged:false, orientationQuizScore:undefined, orientationQuizQuestions:undefined, orientationQuizStages:undefined, orientationQuizConfigKey:undefined};
localStorage.setItem('sibs_nho_v1_applicants', JSON.stringify([applicant]));
let context: ReturnType<typeof useNHO>;
function Screen() {context=useNHO(); return <NHOOrientationViewer />;}
const ui=render(<NHOProvider initialRole="Applicant"><Screen /></NHOProvider>);
assert.equal(context!.submitQuizAnswer(applicant.id,0,99).success,false);
act(() => {assert.equal(context!.completeOrientation(applicant.id,true).success,false);});
for(let part=1;part<=4;part++) {
  fireEvent.click(ui.getByRole('button',{name:new RegExp(`Take Part ${part} Checkpoint Quiz`)}));
  assert.ok(ui.getByText(`Custom question ${part}`));
  const next=ui.getByRole('button',{name:part<4 ? /Save & Continue/ : /Complete Checkpoints/});
  assert.equal(next.disabled,true);
  fireEvent.click(ui.getByRole('button',{name:new RegExp(`Answer-${part}`)}));
  assert.equal(next.disabled,false);
  fireEvent.click(next);
}
fireEvent.click(ui.getByRole('checkbox'));
fireEvent.click(ui.getByRole('button',{name:/Confirm Orientation Completion/}));
assert.equal(context!.activeApplicant.orientationStatus,'Completed');
assert.equal(context!.activeApplicant.orientationVersion,'custom-four-slide-deck');
assert.equal(context!.activeApplicant.orientationQuizScore,4);
assert.equal(context!.activeApplicant.orientationQuizTotal,4);
assert.equal(context!.activeApplicant.orientationQuizQuestions!.length,4);
act(() => {
  localStorage.setItem(ORIENTATION_CONFIG_STORAGE_KEY,JSON.stringify({...config,quizQuestions:config.quizQuestions!.map(q=>({...q,correctOptionIndex:1}))}));
  window.dispatchEvent(new Event('sibs_nho_orientation_config_updated'));
});
assert.equal(context!.activeApplicant.orientationQuizScore,4,'Published edits preserve completed scores');
cleanup();
console.log('PASS published custom checkpoints, sequential quiz flow, answer validation, completion and historical score preservation');
