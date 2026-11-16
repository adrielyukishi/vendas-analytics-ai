
export const HEADERS = ["data","pedido","sku","produto","canal","quantidade","preco_unitario","custo_unitario","taxas","estoque","status"];
export const brl = value => Number(value).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const round = n => Math.round((n + Number.EPSILON)*100)/100;
const validDate = text => /^\d{4}-\d{2}-\d{2}$/.test(text) && Number.isFinite(Date.parse(text+"T00:00:00Z")) && new Date(text+"T00:00:00Z").toISOString().slice(0,10) === text;
const numeric = text => {
  const s=String(text??"").trim();
  if(!s) return null;
  if(!/^-?\d+(?:[.,]\d+)?$/.test(s)) return NaN;
  return Number(s.replace(",","."));
};
// Parser de CSV com aspas, delimitador vírgula ou ponto e vírgula e campos multilinha.
export function parseCsv(text) {
  const input = text.replace(/^\uFEFF/,"");
  const first=input.split(/\r?\n/,1)[0];
  const delimiter=first.includes(";")?";":",";
  const rows=[]; let row=[],cell="",quoted=false,closed=false;
  for(let i=0;i<input.length;i++){
    const ch=input[i];
    if(quoted){
      if(ch==='"'){ if(input[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;} }
      else cell+=ch;
    } else if(ch===delimiter){row.push(cell);cell="";closed=false;}
    else if(ch==="\n"||ch==="\r"){
      if(ch==="\r"&&input[i+1]==="\n") i++;
      row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";closed=false;
    } else if(ch==='"'){
      if(cell||closed) throw new Error("Aspas em posição inválida no CSV.");
      quoted=true;
    } else {
      if(closed) throw new Error("Conteúdo após o fechamento de aspas no CSV.");
      cell+=ch;
    }
  }
  if(quoted)throw new Error("Campo com aspas não fechadas no CSV.");
  row.push(cell);if(row.some(v=>v.trim())) rows.push(row);
  if(rows.length<2)throw new Error("O CSV precisa de cabeçalho e pelo menos uma venda.");
  if(rows.length>50001)throw new Error("Limite de 50.000 linhas excedido.");
  const header=rows.shift().map(v=>v.trim().toLowerCase());
  if(new Set(header).size!==header.length)throw new Error("O cabeçalho contém colunas duplicadas.");
  for(const key of HEADERS)if(!header.includes(key))throw new Error("Coluna obrigatória ausente: "+key);
  const errors=[],sales=[],seen=new Set();
  rows.forEach((values,index)=>{
    const line=index+2;
    const fail=message=>errors.push("Registro "+line+": "+message);
    if(values.length!==header.length){fail("quantidade de colunas diferente do cabeçalho.");return;}
    const r=Object.fromEntries(header.map((key,i)=>[key,values[i].trim()]));
    if(!validDate(r.data)){fail("data inválida; utilize AAAA-MM-DD.");return;}
    if(["pedido","sku","produto","canal"].some(k=>!r[k])){fail("pedido, SKU, produto e canal são obrigatórios.");return;}
    const quantity=numeric(r.quantidade),price=numeric(r.preco_unitario),cost=numeric(r.custo_unitario),fees=numeric(r.taxas),stock=numeric(r.estoque);
    if(!Number.isSafeInteger(quantity)||quantity<=0||!Number.isFinite(price)||price<0){fail("quantidade deve ser um inteiro positivo e preço deve ser não negativo.");return;}
    if([cost,fees,stock].some(n=>n!==null&&(!Number.isFinite(n)||n<0))|| (stock!==null&&!Number.isSafeInteger(stock))){fail("custos, taxas ou estoque inválidos.");return;}
    const status=r.status.toLowerCase();
    if(!["pago","cancelado","devolvido"].includes(status)){fail("status deve ser pago, cancelado ou devolvido.");return;}
    const key=JSON.stringify([r.data,r.pedido,r.sku,r.canal]);
    if(seen.has(key)){fail("linha duplicada para data, pedido, SKU e canal.");return;}
    if(!Number.isFinite(price*quantity)||price*quantity>1e12||(cost!==null&&cost*quantity>1e12)||(fees!==null&&fees>1e12)){fail("valores fora do limite suportado.");return;}
    seen.add(key);
    sales.push({date:r.data,order:r.pedido,sku:r.sku,product:r.produto,channel:r.canal,quantity,price,cost,fees,stock,status});
  });
  // Importação atômica: nunca descartar silenciosamente registros inválidos.
  if(errors.length)throw new Error(errors.slice(0,8).join("\n")+(errors.length>8?"\nE mais "+(errors.length-8)+" erro(s).":""));
  return sales.sort((a,b)=>a.date.localeCompare(b.date));
}
export function demoSales(){
  const rows=[];const end=new Date();const channels=["Mercado Livre","Shopee","Amazon"];
  const products=[["CAM-001","Camiseta básica",59,22,12],["CAN-014","Caneca personalizada",35,9,95],["FON-210","Fone Bluetooth",129,48,34],["CAP-077","Capa de celular",25,6,210],["MOC-033","Mochila urbana",159,71,7],["GAR-120","Garrafa térmica",79,30,58]];
  for(let day=0;day<90;day++){
    const d=new Date(end);d.setDate(end.getDate()-89+day);
    const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
    products.forEach(([sku,product,price,cost,stock],i)=>{
      const quantity=1+(day+i)%4;
      rows.push({date,order:"DEMO-"+day+"-"+i,sku,product,channel:channels[(day+i)%3],quantity,price,cost,fees:round(price*quantity*0.14),stock,status:(day+i)%29===0?"cancelado":"pago"});
    });
  }return rows;
}
export function dateRange(sales,days){
  const end=sales.reduce((last,r)=>r.date>last?r.date:last,"");
  if(!end)return {start:"",end:""};
  const d=new Date(end+"T00:00:00Z");d.setUTCDate(d.getUTCDate()-days+1);
  return {start:d.toISOString().slice(0,10),end};
}
export function filterSales(sales,start,end,channel="Todos"){
  return sales.filter(r=>(!start||r.date>=start)&&(!end||r.date<=end)&&(channel==="Todos"||r.channel===channel));
}
export function summarize(sales){
  const paid=sales.filter(r=>r.status==="pago");
  const revenue=round(paid.reduce((s,r)=>s+r.quantity*r.price,0));
  const complete=paid.length>0&&paid.every(r=>r.cost!==null&&r.fees!==null);
  const profit=complete?round(paid.reduce((s,r)=>s+r.quantity*(r.price-r.cost)-r.fees,0)):null;
  const orders=new Set(paid.map(r=>JSON.stringify([r.channel,r.order]))).size;
  return {revenue,profit,margin:profit!==null&&revenue>0?profit/revenue*100:null,orders,ticket:orders?revenue/orders:0,units:paid.reduce((s,r)=>s+r.quantity,0),excluded:sales.length-paid.length};
}
export function dailyTotals(sales){
  const map=new Map();
  sales.filter(r=>r.status==="pago").forEach(r=>map.set(r.date,(map.get(r.date)||0)+r.quantity*r.price));
  return Array.from(map,([date,revenue])=>({date,revenue:round(revenue)})).sort((a,b)=>a.date.localeCompare(b.date));
}
export function channelTotals(sales){
  const map=new Map();
  sales.filter(r=>r.status==="pago").forEach(r=>map.set(r.channel,(map.get(r.channel)||0)+r.quantity*r.price));
  return Array.from(map,([name,revenue])=>({name,revenue:round(revenue)})).sort((a,b)=>b.revenue-a.revenue);
}
export function abcProducts(sales){
  const map=new Map();
  sales.filter(r=>r.status==="pago").forEach(r=>{
    const p=map.get(r.sku)||{sku:r.sku,name:r.product,revenue:0,units:0};
    p.revenue+=r.quantity*r.price;p.units+=r.quantity;map.set(r.sku,p);
  });
  const sorted=Array.from(map.values()).sort((a,b)=>b.revenue-a.revenue||a.sku.localeCompare(b.sku));
  const total=sorted.reduce((s,p)=>s+p.revenue,0);let cumulative=0;
  return sorted.map(p=>{
    // O item que cruza o limite continua na classe que iniciou.
    const classification=total===0?"C":cumulative<0.8?"A":cumulative<0.95?"B":"C";
    const share=total?p.revenue/total:0;cumulative+=share;
    return {...p,revenue:round(p.revenue),share:share*100,cumulative:Math.min(100,cumulative*100),classification};
  });
}
export function stockProducts(allSales,filtered,days){
  const latest=new Map(),volume=new Map();
  allSales.forEach(r=>{if(r.stock!==null&&(!latest.has(r.sku)||r.date>=latest.get(r.sku).date))latest.set(r.sku,r);});
  filtered.filter(r=>r.status==="pago").forEach(r=>volume.set(r.sku,(volume.get(r.sku)||0)+r.quantity));
  return Array.from(latest.values()).map(r=>{
    const avg=(volume.get(r.sku)||0)/Math.max(1,days);
    const daysLeft=avg>0?Math.floor(r.stock/avg):null;
    const status=r.stock===0?"critico":daysLeft===null?"sem giro":daysLeft<=10?"critico":daysLeft<=30?"atencao":"saudavel";
    return {sku:r.sku,name:r.product,stock:r.stock,date:r.date,avg,daysLeft,status};
  }).sort((a,b)=>(a.daysLeft??Infinity)-(b.daysLeft??Infinity)||a.sku.localeCompare(b.sku));
}
export function exportCsv(sales){
  const safe=value=>{
    let s=String(value??"");
    if(/^[\s]*[=+@-]/.test(s))s="'"+s;
    return '"'+s.replaceAll('"','""')+'"';
  };
  return "\uFEFF"+[HEADERS,...sales.map(r=>[r.date,r.order,r.sku,r.product,r.channel,r.quantity,r.price,r.cost,r.fees,r.stock,r.status])].map(row=>row.map(safe).join(";")).join("\r\n");
}
