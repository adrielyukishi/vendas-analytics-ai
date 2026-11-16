
import {test,expect} from "@playwright/test";
test("navegação, filtros, busca e importação atômica",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/");
 await expect(page.getByRole("heading",{name:"Visão geral",exact:true})).toBeVisible();
 await page.getByRole("button",{name:"7 dias",exact:true}).click();
 await page.getByRole("button",{name:"Estoque",exact:true}).click();
 await page.getByRole("textbox",{name:"Buscar produto ou SKU"}).fill("MOC-033");
 await expect(page.getByRole("cell",{name:"Mochila urbana",exact:true})).toBeVisible();
 await expect(page.getByRole("cell",{name:"Caneca personalizada",exact:true})).toHaveCount(0);
 await page.getByRole("button",{name:"Curva ABC",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Curva ABC por faturamento"})).toBeVisible();
 await page.getByRole("button",{name:"Importar e exportar",exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:"invalido.csv",mimeType:"text/csv",buffer:Buffer.from("a;b\n1;2")});
 await expect(page.getByRole("alert")).toContainText("Coluna obrigatória");
 await expect(page.getByText("Modo demonstração",{exact:true})).toBeVisible();
 const csv="data;pedido;sku;produto;canal;quantidade;preco_unitario;custo_unitario;taxas;estoque;status\n2026-11-01;P1;ABC;Produto teste;Loja;2;100;40;10;5;pago";
 await page.locator('input[type=file]').setInputFiles({name:"vendas.csv",mimeType:"text/csv",buffer:Buffer.from(csv)});
 await expect(page.getByRole("status")).toContainText("1 registro(s)");
 await page.getByRole("button",{name:"Visão geral",exact:true}).click();
 await expect(page.getByText("R$ 200,00",{exact:true})).toBeVisible();
 await expect(page.getByText("R$ 110,00",{exact:true})).toBeVisible();
 await page.screenshot({path:"artifacts/dashboard.png",fullPage:true});
 expect(errors).toEqual([]);
});
test("layout móvel sem rolagem horizontal da página",async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto("/");
 await expect(page.getByRole("heading",{name:"Visão geral",exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.screenshot({path:"artifacts/mobile.png",fullPage:true});
});
