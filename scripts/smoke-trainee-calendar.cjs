const fs=require('fs'),Module=require('module'),ts=require('typescript');
const jsx=(type,props,key)=>({type:typeof type==='string'?type:type?.name||'component',props,key});
const react={createElement:jsx,Fragment:Symbol.for('react.fragment'),useState:v=>[typeof v==='function'?v():v,()=>{}],useEffect:()=>{},useMemo:f=>f(),useCallback:f=>f,useRef:v=>({current:v})};react.default=react;
const original=Module._load;
let demoRole='Employee',trainerName='Maria Cruz';
const ctx={journeys:[],assignments:[],progress:[],assessments:[],assessmentGrades:[],phaseTrainingScores:[],attendance:[],simulatedCurrentDate:'2026-10-14',setSelectedJourney:()=>{},submitAssignment:()=>{},verifyAssignment:()=>{},addTrainingAssignment:()=>{}};
Module._load=function(name,parent,main){
 if(name==='react')return react;
 if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:react.Fragment};
 if(name==='lucide-react')return new Proxy({}, {get:(_,key)=>()=>String(key)});
 if(name.endsWith('JourneyContext'))return {useJourney:()=>ctx};
 if(name.endsWith('DemoAuthContext'))return {useDemoAuth:()=>({user:{role:demoRole,name:demoRole,trainerName,journeyEmployeeId: 'SIBS-2901'}})};
 return original.call(this,name,parent,main);
};
require.extensions['.ts']=require.extensions['.tsx']=function(mod,file){const src=fs.readFileSync(file,'utf8');const out=ts.transpileModule(src,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});mod._compile(out.outputText,file);};
const init=require('../src/components/journey/journeyInitialData.ts');for(const name of ['journeys','assignments','progress','assessments','assessmentGrades','phaseTrainingScores','attendance'])ctx[name]=init['INITIAL_'+name.replace(/([A-Z])/g,'_$1').toUpperCase()];
const comp=require('../src/components/journey/views/TraineeDashboardView.tsx').default;
for(const role of ['Employee','Trainer','HR Admin']){
 demoRole=role;
 const output=JSON.stringify(comp({}),(_key,value)=>typeof value==='function'?undefined:value);
 if(!output.includes('My Training Calendar')||!output.includes('My Training Scores')||!output.includes('Training Goals'))throw new Error(role+' dashboard missing key content');
 if(role==='Employee' && output.includes('+ Assign training activity'))throw new Error('Employee must not create tasks');
 if(role==='Employee' && output.includes('Viewing employee'))throw new Error('Employee must not see staff-only employee switcher');
 if(role==='HR Admin' && !output.includes('Viewing employee'))throw new Error('Staff-only employee switcher missing');
 if(!output.includes('My training · selected day') || !output.includes('My Progress & Attendance'))throw new Error(role+' employee-first information hierarchy missing');
 if(!output.includes('Week') || !output.includes('Month'))throw new Error(role+' calendar toggle missing');
 if(role==='HR Admin' && !output.includes('+ Assign training activity'))throw new Error('Staff assignment control missing');
 console.log('PASS '+role+' calendar and scorecard UI render ('+output.length+' bytes)');
}
