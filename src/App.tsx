
import {useMemo,useRef,useState} from "react";
import {Area,AreaChart,Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {abcProducts,brl,channelTotals,dailyTotals,dateRange,demoSales,exportCsv,filterSales,parseCsv,stockProducts,summarize} from "./analytics.mjs";

const NAV=[["dashboard","Visão geral"],["estoque","Estoque"],["abc","Curva ABC"],["marketplaces","Marketplaces"],["dados","Importar e exportar"]] as const;
type View=typeof NAV[number][0];
const LABEL:Record<string,string>={critico:"Repor agora",atencao:"Repor em breve",saudavel:"Estoque saudável","sem giro":"Sem vendas no período"};
const fmtDate=(date:string)=>date?date.split("-").reverse().join("/"):"—";

function download(name:string,content:string){
 const url=URL.createObjectURL(new Blob([content],{type:"text/csv;charset=utf-8;"}));
 const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function App(){
 const [allSales,setAllSales]=useState(()=>demoSales());
 const [view,setView]=useState<View>("dashboard");
 const [source,setSource]=useState("Demonstração — dados fictícios");
 const [demo,setDemo]=useState(true);
 const initial=dateRange(allSales,30);
 const [start,setStart]=useState(initial.start),[end,setEnd]=useState(initial.end);
 const [channel,setChannel]=useState("Todos"),[query,setQuery]=useState("");
 const [error,setError]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 const input=useRef<HTMLInputElement>(null);
 const invalid=!start||!end||start>end;
 const sales=useMemo(()=>invalid?[]:filterSales(allSales,start,end,channel),[allSales,start,end,channel,invalid]);
 const k=summarize(sales),daily=dailyTotals(sales),channels=channelTotals(sales),abc=abcProducts(sales);
 const windowDays=start&&end&&!invalid?Math.floor((Date.parse(end+"T00:00:00Z")-Date.parse(start+"T00:00:00Z"))/86400000)+1:1;
 // Estoque é consolidado por SKU. O canal filtra vendas, não o saldo global.
 const stock=stockProducts(allSales,sales,windowDays).filter(p=>(p.name+" "+p.sku).toLowerCase().includes(query.toLowerCase()));
 const options=Array.from(new Set(allSales.map(r=>r.channel))).sort();
 function period(days:number){const range=dateRange(allSales,days);setStart(range.start);setEnd(range.end);}
 async function importFile(file?:File){
   if(!file)return;setError("");setMessage("");
   if(file.size>5*1024*1024){setError("O arquivo deve ter no máximo 5 MB.");return;}
   setBusy(true);
   try{
     const records=parseCsv(await file.text());
     setAllSales(records);const range=dateRange(records,30);setStart(range.start);setEnd(range.end);
     setChannel("Todos");setSource("CSV importado: "+file.name);setDemo(false);
     setMessage(records.length+" registro(s) importado(s). A base anterior foi substituída.");
   }catch(err){setError(err instanceof Error?err.message:"Falha ao importar arquivo.");}
   finally{setBusy(false);if(input.current)input.current.value="";}
 }
 function restore(){
   const records=demoSales();setAllSales(records);const range=dateRange(records,30);setStart(range.start);setEnd(range.end);
   setChannel("Todos");setDemo(true);setSource("Demonstração — dados fictícios");setError("");setMessage("Base demonstrativa restaurada.");
 }
 const cards=[
   ["Receita bruta",brl(k.revenue),"Somente itens com status pago"],
   ["Resultado estimado",k.profit===null?"Indisponível":brl(k.profit),"Receita − produtos − taxas informadas"],
   ["Margem estimada",k.margin===null?"Indisponível":k.margin.toFixed(1)+"%","Não inclui despesas não informadas"],
   ["Pedidos",String(k.orders),"Ticket médio "+brl(k.ticket)]
 ];
 return <div className="layout">
  <aside className="sidebar">
   <h1 className="brand">Analytics</h1>
   <nav aria-label="Navegação principal">{NAV.map(([id,label])=><button key={id} className={"nav "+(view===id?"active":"")} aria-current={view===id?"page":undefined} onClick={()=>setView(id)}>{label}</button>)}</nav>
   <p className="muted small">Projeto acadêmico de Ciência de Dados.</p>
  </aside>
  <main className="content">
   <header className="row between"><h2>{NAV.find(n=>n[0]===view)?.[1]}</h2><span className="badge saudavel">{demo?"Modo demonstração":"Base CSV"}</span></header>
   <div className="notice"><strong>{source}</strong><br/>Os arquivos são processados apenas nesta página. A base não é enviada a um servidor e será perdida ao recarregar. Nenhuma conta de marketplace está conectada.</div>
   <section className="card filters" aria-label="Filtros de análise">
    <label>De<input type="date" value={start} onChange={e=>setStart(e.target.value)} required/></label>
    <label>Até<input type="date" value={end} onChange={e=>setEnd(e.target.value)} required/></label>
    <label>Canal<select value={channel} onChange={e=>setChannel(e.target.value)}><option>Todos</option>{options.map(c=><option key={c}>{c}</option>)}</select></label>
    <div className="row" aria-label="Atalhos de período">{[7,30,90].map(p=><button className="chip" key={p} onClick={()=>period(p)}>{p} dias</button>)}</div>
   </section>
   <p className="muted small">Atalhos usam a última data da base. Período: {fmtDate(start)} a {fmtDate(end)}. Cancelamentos e devoluções são excluídos dos indicadores.</p>
   {(invalid||!start||!end)&&<p className="error" role="alert">Informe as duas datas; a data inicial deve ser anterior ou igual à final.</p>}
   {error&&<p className="error" role="alert">{error}</p>}
   {message&&<p className="notice" role="status">{message}</p>}
   {!sales.length&&<p className="notice">Nenhum registro corresponde aos filtros selecionados.</p>}
   {view==="dashboard"&&<>
    <div className="grid kpis">{cards.map(([label,value,hint])=><article className="card kpi" key={label}><span className="muted">{label}</span><strong className="kpi-value">{value}</strong><small className="muted">{hint}</small></article>)}</div>
    {k.profit===null&&sales.length>0&&<p className="muted">Para calcular o resultado, preencha custo unitário e taxas em todos os itens pagos do período. Zero é permitido; campo vazio significa informação ausente.</p>}
    <div className="grid two">
     <section className="card"><h3>Evolução das vendas</h3><ResponsiveContainer width="100%" height={260}><AreaChart data={daily}><CartesianGrid strokeDasharray="3 3" stroke="#2b3340"/><XAxis dataKey="date" tickFormatter={d=>String(d).slice(5)} stroke="#8b95a5"/><YAxis stroke="#8b95a5"/><Tooltip formatter={v=>brl(Number(v??0))}/><Area dataKey="revenue" name="Receita" stroke="#2a9d8f" fill="#2a9d8f" fillOpacity={0.25}/></AreaChart></ResponsiveContainer></section>
     <section className="card"><h3>Receita por marketplace</h3><ResponsiveContainer width="100%" height={260}><BarChart data={channels} layout="vertical" margin={{left:12}}><CartesianGrid strokeDasharray="3 3" stroke="#2b3340"/><XAxis type="number" stroke="#8b95a5"/><YAxis type="category" dataKey="name" width={110} stroke="#8b95a5"/><Tooltip formatter={v=>brl(Number(v??0))}/><Bar dataKey="revenue" name="Receita" fill="#e9c46a"/></BarChart></ResponsiveContainer></section>
    </div>
    <section className="card"><h3>Leitura dos resultados</h3><p>Foram vendidos {k.units} itens em {k.orders} pedidos. {k.excluded} registro(s) cancelado(s) ou devolvido(s) ficaram fora dos cálculos.</p>
     {abc[0]&&<p>O produto {abc[0].name} representa {abc[0].share.toFixed(1)}% da receita filtrada. Consulte a curva ABC para avaliar a concentração do faturamento.</p>}
     <p className="muted small">Análises calculadas por regras matemáticas. Esta versão não utiliza IA generativa ou previsão de vendas.</p>
    </section>
   </>}
   {view==="estoque"&&<section className="card">
    <header className="row between"><h3>Estoque operacional</h3><input className="search" aria-label="Buscar produto ou SKU" placeholder="Buscar produto ou SKU" value={query} onChange={e=>setQuery(e.target.value)}/></header>
    <p className="muted small">Saldo global mais recente informado por SKU, sem somar saldos entre canais. A média diária usa as vendas filtradas divididas pelos {windowDays} dias do intervalo. A cobertura pressupõe ritmo constante e não considera reposições.</p>
    <div className="scroll"><table><thead><tr>{["Produto","SKU","Saldo informado em","Estoque","Vendas/dia","Cobertura (dias)","Situação"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
     {stock.map(p=><tr key={p.sku}><td>{p.name}</td><td>{p.sku}</td><td>{fmtDate(p.date)}</td><td>{p.stock}</td><td>{p.avg.toFixed(2)}</td><td>{p.daysLeft??"Sem giro"}</td><td><span className={"badge "+p.status}>{LABEL[p.status]}</span></td></tr>)}
     {!stock.length&&<tr><td colSpan={7}>Nenhum estoque informado ou produto encontrado.</td></tr>}
    </tbody></table></div>
   </section>}
   {view==="abc"&&<section className="card"><h3>Curva ABC por faturamento</h3><p className="muted small">Produtos em ordem decrescente de receita. Faixas aproximadas: A até 80%, B até 95%, C restante. O item que ultrapassa o limite fica na classe que iniciou; a proporção exata depende do catálogo.</p>
    <div className="scroll"><table><thead><tr>{["SKU","Produto","Unidades","Receita","Participação","Acumulado","Classe"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{abc.map(p=><tr key={p.sku}><td>{p.sku}</td><td>{p.name}</td><td>{p.units}</td><td>{brl(p.revenue)}</td><td>{p.share.toFixed(1)}%</td><td>{p.cumulative.toFixed(1)}%</td><td>{p.classification}</td></tr>)}
    {!abc.length&&<tr><td colSpan={7}>Nenhuma venda paga no período.</td></tr>}</tbody></table></div>
   </section>}
   {view==="marketplaces"&&<section className="card"><h3>Origens das informações</h3><p>Todos os canais abaixo vêm da base {demo?"fictícia de demonstração":"CSV importada"}. Não há autenticação OAuth, consulta de APIs ou sincronização automática nesta versão.</p><ul className="list">{options.map(name=><li className="row between" key={name}><strong>{name}</strong><span className="muted">{demo?"Dados simulados":"Importação por CSV"}</span></li>)}</ul><p className="muted small">Integrações reais exigem backend, autorização do titular da conta e armazenamento seguro de credenciais. Não insira tokens no CSV ou no código público.</p></section>}
   {view==="dados"&&<section className="card"><h3>Importação e exportação</h3>
    <p>Baixe o exemplo e mantenha os nomes das colunas. Cada linha representa um produto de um pedido. A importação substitui a base atual somente se todos os registros forem válidos.</p>
    <div className="toolbar"><label>Selecionar CSV (até 5 MB)<input ref={input} className="file" type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>void importFile(e.target.files?.[0])}/></label></div>
    <p className="muted small">Datas em AAAA-MM-DD; números sem separador de milhar; vírgula decimal aceita em CSV separado por ponto e vírgula. Status: pago, cancelado ou devolvido. Não envie dados pessoais.</p>
    <div className="toolbar"><button className="btn" onClick={()=>download("modelo-vendas-ficticias.csv",exportCsv(demoSales().slice(-24)))}>Baixar exemplo fictício</button><button className="btn secondary" disabled={!sales.length||invalid||!start||!end} onClick={()=>download("vendas-filtradas.csv",exportCsv(sales))}>Exportar registros filtrados</button><button className="btn secondary" disabled={busy} onClick={restore}>Restaurar demonstração</button></div>
    <p className="muted small">A exportação contém todas as linhas filtradas, incluindo cancelamentos e devoluções; os indicadores usam apenas vendas pagas. Estoque é opcional. Custos e taxas vazios impedem estimar resultado.</p>
   </section>}
  </main>
 </div>;
}
