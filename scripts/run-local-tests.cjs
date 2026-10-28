// Local-source test harness for supplied archives without node_modules.
const Module = require('module');
const fs = require('fs');
const path = require('path');
const ts = require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const originalLoad = Module._load;
const noop = () => {};
const react = {
  createContext: (defaultValue) => ({ Provider: noop, _value: defaultValue }),
  useContext: (ctx) => ctx._value,
  useState: (value) => [typeof value === 'function' ? value() : value, noop],
  useEffect: noop,
  useMemo: (func) => func(),
  useCallback: (f) => f,
  useRef: (v) => ({ current: v }),
  createElement: (...args) => ({ jsx: args }),
  Fragment: Symbol.for('react.fragment')
};
react.default = react;
const jsxRuntime = { jsx: (type, props, key) => ({ type, props, key }), jsxs: (type, props, key) => ({type, props, key}), Fragment: react.Fragment };
Module._load = function(request, parent, isMain) {
  if(request === 'react') return react;
  if(request === 'react/jsx-runtime') return jsxRuntime;
  if(request === 'lucide-react') return new Proxy({}, { get: (_, name) => () => String(name) });
  if(request === 'motion/react') return {motion: {div: noop}};
  return originalLoad.call(this, request, parent, isMain);
};
function loader(m, filename) {
  const src=fs.readFileSync(filename,'utf8');
  const out=ts.transpileModule(src,{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}});
  m._compile(out.outputText,filename);
}
require.extensions['.ts']=loader;
require.extensions['.tsx']=loader;
const target=path.resolve(process.argv[2]);
process.chdir(path.dirname(path.dirname(target)));
require(target);
