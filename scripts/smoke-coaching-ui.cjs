const fs=require('fs'),Module=require('module'),path=require('path'),ts=require('typescript');
const jsx=(type,props,key)=>({type:typeof type==='string'?type:type?.name || 'component',props,key});
const react={createElement:jsx,Fragment:Symbol.for('react.fragment'),useState:v=>[typeof v==='function'?v():v,()=>{}],useEffect:()=>{},useMemo:f=>f(),useCallback:f=>f,useRef:v=>({current:v})};react.default=react;
const original=Module._load;
const data={sessions:[],effects:[]};
let demoRole='Trainer';
const context={journeys:[],assignments:[],progress:[],assessments:[],assessmentGrades:[],phaseTrainingScores:[],attendance:[],evidence:[],qdsRequests:[],esepSessions:data.sessions,esepEvaluations:data.effects,simulatedCurrentDate:'2026-10-14',setSelectedJourney:()=>{},saveAssessmentGrade:()=>{},verifyAssignment:()=>{},addQDSRequest:()=>{},updateQDSRequestStatus:()=>{}};
Module._load=function(name,parent,main){
 if(name==='react')return react;
 if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:react.Fragment};
 if(name==='lucide-react')return new Proxy({}, {get:(_,key)=>()=>String(key)});
 if(name.endsWith('JourneyContext'))return {useJourney:()=>context};
 if(name.endsWith('DemoAuthContext'))return {useDemoAuth:()=>({user:{role:demoRole,name:demoRole==='Trainer'?'Maria Cruz':'QDS',trainerName:'Maria Cruz'}})};
 return original.call(this,name,parent,main);
};
require.extensions['.ts']=require.extensions['.tsx']=function(mod,file){const src=fs.readFileSync(file,'utf8');const out=ts.transpileModule(src,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});mod._compile(out.outputText,file);};
const init=require('../src/components/journey/journeyInitialData.ts');context.esepSessions=init.INITIAL_ESEP_SESSIONS;context.esepEvaluations=init.INITIAL_ESEP_EVALUATIONS;for(const [k,v] of Object.entries({journeys:init.INITIAL_JOURNEYS,assignments:init.INITIAL_ASSIGNMENTS,progress:init.INITIAL_PROGRESS,assessments:init.INITIAL_ASSESSMENTS,assessmentGrades:init.INITIAL_ASSESSMENT_GRADES,phaseTrainingScores:init.INITIAL_PHASE_TRAINING_SCORES,attendance:init.INITIAL_ATTENDANCE,evidence:init.INITIAL_EVIDENCE,qdsRequests:init.INITIAL_QDS_REQUESTS}))context[k]=v;
const trainer=require('../src/components/journey/views/TrainerMonitoringView.tsx').default;
const qds=require('../src/components/journey/views/QDSDashboardView.tsx').default;
const modal=require('../src/components/journey/TrainerCoachingDetailsModal.tsx').default;
const tests=[['Trainer view',()=>{demoRole='Trainer';return trainer({})}],['QDS view',()=>{demoRole='QDS';return qds({})}],['Admin QDS oversight',()=>{demoRole='HR Admin';return qds({})}],['Coaching modal',()=>modal({employee:init.INITIAL_JOURNEYS[0],sessions:context.esepSessions,evaluations:context.esepEvaluations,asOf:context.simulatedCurrentDate,onClose:()=>{}})]];
for(const [name,fn] of tests){const tree=fn();if(!tree||!tree.type)throw new Error(name+' not rendered');const body=JSON.stringify(tree,(_key,val)=>typeof val==='function'?undefined:val);if(body.length<100)throw new Error(name+' unexpectedly empty');console.log('PASS',name,'tree bytes',body.length)}
