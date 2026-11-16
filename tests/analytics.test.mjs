
import test from "node:test";
import assert from "node:assert/strict";
import {HEADERS,parseCsv,exportCsv,demoSales,summarize,dateRange,filterSales,abcProducts,stockProducts} from "../src/analytics.mjs";
const item=(extra={})=>({date:"2026-11-01",order:"P1",sku:"A",product:"Produto A",channel:"Loja",quantity:2,price:100,cost:40,fees:10,stock:10,status:"pago",...extra});
test("pedidos são únicos por canal e cancelados/devolvidos não entram",()=>{
 const result=summarize([item(),item({sku:"B",quantity:1,price:50,cost:20,fees:5}),item({channel:"Outra",quantity:1}),item({order:"C",status:"cancelado"}),item({order:"D",status:"devolvido"})]);
 assert.equal(result.orders,2);assert.equal(result.revenue,350);assert.equal(result.profit,185);assert.equal(result.excluded,2);
});
test("custos ausentes não são interpretados como zero",()=>{
 assert.equal(summarize([item({cost:null})]).profit,null);
 assert.equal(summarize([item({fees:null})]).profit,null);
 assert.equal(summarize([]).margin,null);
 assert.equal(summarize([item({price:0,cost:0,fees:0})]).margin,null);
});
test("CSV suporta ponto e vírgula, vírgula decimal, aspas, UTF-8 e campos multilinha",()=>{
 const records=[item({product:'Caneca; "Especial"\nAzul',price:10.5})];
 assert.deepEqual(parseCsv(exportCsv(records)),records);
 const csv=HEADERS.join(";")+"\n2026-11-01;P1;A;Produto;Loja;2;10,50;;;10;pago";
 assert.equal(parseCsv(csv)[0].price,10.5);assert.equal(parseCsv(csv)[0].cost,null);
});
test("validação rejeita datas impossíveis, negativos, duplicatas e campos obrigatórios",()=>{
 const raw=exportCsv([item()]);
 assert.throws(()=>parseCsv(raw.replace("2026-11-01","2026-02-30")),/data inválida/);
 assert.throws(()=>parseCsv(exportCsv([item(),item()])),/duplicada/);
 assert.throws(()=>parseCsv(raw.replace('"2"','"-2"')),/quantidade/);
 assert.throws(()=>parseCsv(raw.replace("preco_unitario","outro")),/ausente/);
 assert.throws(()=>parseCsv(HEADERS.join(";")+'\n"sem fim'),/aspas/);
});
test("filtros por data/canal e atalho de sete dias são inclusivos",()=>{
 const records=[item({date:"2026-11-01"}),item({date:"2026-11-07",order:"P2"}),item({date:"2026-11-08",order:"P3",channel:"Outra"})];
 assert.deepEqual(dateRange(records,7),{start:"2026-11-02",end:"2026-11-08"});
 assert.equal(filterSales(records,"2026-11-01","2026-11-07","Loja").length,2);
});
test("ABC aplica os limites acumulados e mantém o item que cruza a faixa",()=>{
 const rows=[80,15,5].map((price,i)=>item({sku:String(i),order:String(i),quantity:1,price}));
 assert.deepEqual(abcProducts(rows).map(p=>p.classification),["A","B","C"]);
 assert.deepEqual(abcProducts([item({price:0})]).map(p=>p.classification),["C"]);
});
test("estoque usa o saldo mais recente e divide as vendas pelo intervalo completo",()=>{
 const old=item({stock:20}),latest=item({order:"P2",date:"2026-11-02",stock:0});
 const [p]=stockProducts([old,latest],[old,latest],10);
 assert.equal(p.stock,0);assert.equal(p.avg,0.4);assert.equal(p.status,"critico");
 assert.equal(stockProducts([item() ],[],30)[0].daysLeft,null);
});
test("demo tem 90 dias e exportação preserva a base",()=>{
 const rows=demoSales();assert.equal(new Set(rows.map(r=>r.date)).size,90);
 assert.deepEqual(parseCsv(exportCsv(rows)),rows);
});
test("exportação neutraliza fórmulas em texto",()=>{
 const csv=exportCsv([item({product:"=1+1"})]);
 assert.equal(parseCsv(csv)[0].product,"'=1+1");
});
