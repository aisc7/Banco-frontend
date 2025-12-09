import{k as F,l as w,c as j,m as G,_ as K,n as x,o as X,j as a,s as _,p as W,q as u,t as Z,v as I,w as R,x as J,y as Q,i as E,r as H,B as d,T as c,f as Y,I as k,C as rr}from"./index--atX_XUv.js";import{d as er}from"./Refresh-Ch8CxwOq.js";import{d as ar,a as tr}from"./Delete-DmNm5JzK.js";import{d as or}from"./Edit-BS3FQbLK.js";import{A as P}from"./AppButton-DGApZOMm.js";import{A as sr}from"./AppTable-CM16yi9f.js";import{c as ir,o as B,u as nr}from"./usePrestatariosStore-sSrOd6db.js";import{u as lr}from"./usePagination-Djf72Sih.js";import{u as cr}from"./useConfirmationDialog-D18w31vS.js";import{B as S}from"./Button-C1kfnTXj.js";import{f as dr}from"./format-DtUmTUMm.js";import{u as ur}from"./useI18n-nd37995H.js";function fr(r){return F("MuiLinearProgress",r)}w("MuiLinearProgress",["root","colorPrimary","colorSecondary","determinate","indeterminate","buffer","query","dashed","dashedColorPrimary","dashedColorSecondary","bar","barColorPrimary","barColorSecondary","bar1Indeterminate","bar1Determinate","bar1Buffer","bar2Indeterminate","bar2Buffer"]);const mr=["className","color","value","valueBuffer","variant"];let y=r=>r,D,M,q,N,O,T;const $=4,pr=R(D||(D=y`
  0% {
    left: -35%;
    right: 100%;
  }

  60% {
    left: 100%;
    right: -90%;
  }

  100% {
    left: 100%;
    right: -90%;
  }
`)),br=R(M||(M=y`
  0% {
    left: -200%;
    right: 100%;
  }

  60% {
    left: 107%;
    right: -8%;
  }

  100% {
    left: 107%;
    right: -8%;
  }
`)),hr=R(q||(q=y`
  0% {
    opacity: 1;
    background-position: 0 -23px;
  }

  60% {
    opacity: 0;
    background-position: 0 -23px;
  }

  100% {
    opacity: 1;
    background-position: -200px -23px;
  }
`)),gr=r=>{const{classes:e,variant:t,color:s}=r,f={root:["root",`color${u(s)}`,t],dashed:["dashed",`dashedColor${u(s)}`],bar1:["bar",`barColor${u(s)}`,(t==="indeterminate"||t==="query")&&"bar1Indeterminate",t==="determinate"&&"bar1Determinate",t==="buffer"&&"bar1Buffer"],bar2:["bar",t!=="buffer"&&`barColor${u(s)}`,t==="buffer"&&`color${u(s)}`,(t==="indeterminate"||t==="query")&&"bar2Indeterminate",t==="buffer"&&"bar2Buffer"]};return Z(f,fr,e)},L=(r,e)=>e==="inherit"?"currentColor":r.vars?r.vars.palette.LinearProgress[`${e}Bg`]:r.palette.mode==="light"?J(r.palette[e].main,.62):Q(r.palette[e].main,.5),vr=_("span",{name:"MuiLinearProgress",slot:"Root",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.root,e[`color${u(t.color)}`],e[t.variant]]}})(({ownerState:r,theme:e})=>x({position:"relative",overflow:"hidden",display:"block",height:4,zIndex:0,"@media print":{colorAdjust:"exact"},backgroundColor:L(e,r.color)},r.color==="inherit"&&r.variant!=="buffer"&&{backgroundColor:"none","&::before":{content:'""',position:"absolute",left:0,top:0,right:0,bottom:0,backgroundColor:"currentColor",opacity:.3}},r.variant==="buffer"&&{backgroundColor:"transparent"},r.variant==="query"&&{transform:"rotate(180deg)"})),xr=_("span",{name:"MuiLinearProgress",slot:"Dashed",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.dashed,e[`dashedColor${u(t.color)}`]]}})(({ownerState:r,theme:e})=>{const t=L(e,r.color);return x({position:"absolute",marginTop:0,height:"100%",width:"100%"},r.color==="inherit"&&{opacity:.3},{backgroundImage:`radial-gradient(${t} 0%, ${t} 16%, transparent 42%)`,backgroundSize:"10px 10px",backgroundPosition:"0 -23px"})},I(N||(N=y`
    animation: ${0} 3s infinite linear;
  `),hr)),yr=_("span",{name:"MuiLinearProgress",slot:"Bar1",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.bar,e[`barColor${u(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&e.bar1Indeterminate,t.variant==="determinate"&&e.bar1Determinate,t.variant==="buffer"&&e.bar1Buffer]}})(({ownerState:r,theme:e})=>x({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left",backgroundColor:r.color==="inherit"?"currentColor":(e.vars||e).palette[r.color].main},r.variant==="determinate"&&{transition:`transform .${$}s linear`},r.variant==="buffer"&&{zIndex:1,transition:`transform .${$}s linear`}),({ownerState:r})=>(r.variant==="indeterminate"||r.variant==="query")&&I(O||(O=y`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `),pr)),jr=_("span",{name:"MuiLinearProgress",slot:"Bar2",overridesResolver:(r,e)=>{const{ownerState:t}=r;return[e.bar,e[`barColor${u(t.color)}`],(t.variant==="indeterminate"||t.variant==="query")&&e.bar2Indeterminate,t.variant==="buffer"&&e.bar2Buffer]}})(({ownerState:r,theme:e})=>x({width:"100%",position:"absolute",left:0,bottom:0,top:0,transition:"transform 0.2s linear",transformOrigin:"left"},r.variant!=="buffer"&&{backgroundColor:r.color==="inherit"?"currentColor":(e.vars||e).palette[r.color].main},r.color==="inherit"&&{opacity:.3},r.variant==="buffer"&&{backgroundColor:L(e,r.color),transition:`transform .${$}s linear`}),({ownerState:r})=>(r.variant==="indeterminate"||r.variant==="query")&&I(T||(T=y`
      width: auto;
      animation: ${0} 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
    `),br)),Cr=j.forwardRef(function(e,t){const s=G({props:e,name:"MuiLinearProgress"}),{className:f,color:b="primary",value:h,valueBuffer:l,variant:o="indeterminate"}=s,g=K(s,mr),n=x({},s,{color:b,variant:o}),m=gr(n),p=X(),i={},C={bar1:{},bar2:{}};if((o==="determinate"||o==="buffer")&&h!==void 0){i["aria-valuenow"]=Math.round(h),i["aria-valuemin"]=0,i["aria-valuemax"]=100;let v=h-100;p&&(v=-v),C.bar1.transform=`translateX(${v}%)`}if(o==="buffer"&&l!==void 0){let v=(l||0)-100;p&&(v=-v),C.bar2.transform=`translateX(${v}%)`}return a.jsxs(vr,x({className:W(m.root,f),ownerState:n,role:"progressbar"},i,{ref:t},g,{children:[o==="buffer"?a.jsx(xr,{className:m.dashed,ownerState:n}):null,a.jsx(yr,{className:m.bar1,ownerState:n,style:C.bar1}),o==="determinate"?null:a.jsx(jr,{className:m.bar2,ownerState:n,style:C.bar2})]}))});var z={},_r=E;Object.defineProperty(z,"__esModule",{value:!0});var U=z.default=void 0,kr=_r(H()),Pr=a;U=z.default=(0,kr.default)((0,Pr.jsx)("path",{d:"M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11z"}),"UploadFile");var A={},$r=E;Object.defineProperty(A,"__esModule",{value:!0});var V=A.default=void 0,Ir=$r(H()),Rr=a;V=A.default=(0,Ir.default)((0,Rr.jsx)("path",{d:"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-5 14H7v-2h7zm3-4H7v-2h10zm0-4H7V7h10z"}),"Article");const Lr=()=>{const[r,e]=j.useState(!1),[t,s]=j.useState(null),[f,b]=j.useState([]),h=async o=>{var n;const g=(n=o.target.files)==null?void 0:n[0];if(g){e(!0),s(null);try{const m=await g.text(),p=await ir({content:m,nombre_archivo:g.name,usuario:"frontend"});s(`Total: ${p.total}, aceptados: ${p.aceptados}, rechazados: ${p.rechazados}`);const i=await B();b(i)}finally{e(!1)}}},l=async()=>{e(!0);try{const o=await B();b(o)}finally{e(!1)}};return a.jsxs(d,{mt:4,children:[a.jsx(c,{variant:"h6",mb:1,children:"Carga masiva de prestatarios"}),a.jsx(c,{variant:"body2",mb:2,children:"Sube un archivo CSV/TXT con los campos requeridos por el backend para registrar múltiples clientes."}),a.jsxs(S,{variant:"outlined",component:"label",startIcon:a.jsx(U,{}),disabled:r,children:["Seleccionar archivo",a.jsx("input",{type:"file",hidden:!0,accept:".csv,.txt",onChange:h})]}),r&&a.jsx(Cr,{sx:{mt:2}}),t&&a.jsx(c,{variant:"body2",mt:2,children:t}),a.jsxs(d,{mt:3,children:[a.jsxs(d,{display:"flex",alignItems:"center",mb:1,gap:1,children:[a.jsx(V,{fontSize:"small"}),a.jsx(c,{variant:"subtitle2",children:"Logs de carga recientes"}),a.jsx(S,{size:"small",onClick:l,children:"Actualizar"})]}),f.length===0?a.jsx(c,{variant:"body2",children:"No hay logs de carga."}):a.jsx("ul",{children:f.map(o=>a.jsxs("li",{children:[o.NOMBRE_ARCHIVO??o.nombre_archivo," —"," ",o.FECHA_CARGA??o.fecha_carga," — usuario:"," ",o.USUARIO??o.usuario," — ok:"," ",o.REGISTROS_VALIDOS??o.registros_validos," / errores:"," ",o.REGISTROS_RECHAZADOS??o.registros_rechazados]},o.ID_LOG_PK??o.id_log_pk))})]})]})},Ur=()=>{const{items:r,loading:e,error:t,fetchAll:s,remove:f}=nr(),{t:b}=ur(),h=Y(),{page:l,totalPages:o,paginatedItems:g,setPage:n}=lr(r,10),m=cr();j.useEffect(()=>{s().catch(()=>{})},[s]);const p=i=>{m.ask("¿Deseas eliminar este prestatario?",()=>{f(i).catch(()=>{})})};return a.jsxs(d,{children:[a.jsxs(d,{display:"flex",alignItems:"center",justifyContent:"space-between",mb:2,children:[a.jsx(c,{variant:"h5",children:b("prestatarios_title")}),a.jsxs(d,{display:"flex",gap:1,children:[a.jsx(k,{color:"primary",onClick:()=>s(),children:a.jsx(er,{})}),a.jsx(P,{startIcon:a.jsx(ar,{}),onClick:()=>h("/prestatarios/nuevo"),children:"Nuevo prestatario"})]})]}),a.jsx(c,{variant:"body2",color:"text.secondary",mb:2,children:"Desde esta pantalla el personal autorizado registra y gestiona los clientes (prestatarios) de la entidad financiera."}),e&&a.jsx(d,{display:"flex",justifyContent:"center",my:4,children:a.jsx(rr,{})}),t&&a.jsx(c,{color:"error",mb:2,children:t}),!e&&r.length>0&&a.jsx(sr,{columns:[{key:"ci",header:"Cédula"},{key:"nombre",header:"Nombre"},{key:"apellido",header:"Apellido"},{key:"email",header:"Email"},{key:"telefono",header:"Teléfono"},{key:"estadoCliente",header:"Estado"},{key:"fechaRegistro",header:"Fecha registro",render:i=>dr(i.fechaRegistro)},{key:"acciones",header:"Acciones",render:i=>a.jsxs(d,{display:"flex",gap:1,children:[a.jsx(k,{size:"small",color:"primary",children:a.jsx(or,{fontSize:"small"})}),a.jsx(k,{size:"small",color:"error",onClick:()=>p(i.ci),children:a.jsx(tr,{fontSize:"small"})})]})}],data:g}),!e&&r.length===0&&!t&&a.jsx(c,{variant:"body2",mt:2,children:b("prestatarios_empty")}),o>1&&a.jsxs(d,{display:"flex",justifyContent:"center",mt:2,gap:1,children:[a.jsx(P,{size:"small",disabled:l<=1,onClick:()=>n(l-1),children:"Anterior"}),a.jsxs(c,{variant:"body2",sx:{alignSelf:"center"},children:["Página ",l," de ",o]}),a.jsx(P,{size:"small",disabled:l>=o,onClick:()=>n(l+1),children:"Siguiente"})]}),a.jsx(Lr,{})]})};export{Ur as PrestatariosListPage,Ur as default};
