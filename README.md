# Analytics — análise comercial para pequenos negócios

Protótipo acadêmico do curso de Ciência de Dados da UNINTER.
**Adriel Yukishi Figueiredo Yamada — RU 2173582.**

## O que esta versão faz

- Dashboard de receita bruta, pedidos únicos por canal, ticket médio, resultado e margem estimados.
- Filtros por data e canal, atalhos de 7, 30 e 90 dias.
- Gráficos de evolução e participação dos canais calculados sobre as mesmas vendas filtradas.
- Curva ABC por faturamento, com participação e percentual acumulado por SKU.
- Cobertura de estoque e alertas de reposição, com busca por nome ou SKU.
- Importação validada de CSV e exportação dos registros filtrados.
- Demonstração inicial com 90 dias de dados fictícios, identificada na interface.

## Executar no computador

Instale Node.js 22.12 ou superior e Git. No terminal:

```bash
git clone https://github.com/adrielyukishi/vendas-analytics-ai.git
cd vendas-analytics-ai
npm install
npm run dev
```

Abra o endereço exibido no terminal, normalmente http://localhost:5173.

```bash
npm test
npm run build
npm run preview
```

O build gera a pasta `dist/`. A configuração da Vercel está em `vercel.json`.
Para testar o navegador:

```bash
npx playwright install chromium
npm run test:e2e
```

A workflow **Validar projeto** executa testes, compilação TypeScript, build e testes de navegador. Capturas ficam no artefato `verificacao-visual` de cada execução.
A presença dos testes não significa que todos passaram: confira o resultado em **Actions**.

## Importar vendas

Na tela **Importar e exportar**, baixe o exemplo fictício, preencha-o e selecione seu CSV.
A importação substitui a base apenas quando todas as linhas são válidas.
Limites: 5 MB e 50.000 registros; codificação UTF-8; vírgula ou ponto e vírgula como delimitador.

| Coluna | Regra |
| --- | --- |
| data | Data válida em AAAA-MM-DD |
| pedido | Identificador do pedido, sem dados pessoais |
| sku | Identificador do produto, compartilhado entre canais |
| produto | Nome do produto |
| canal | Nome do canal de venda |
| quantidade | Inteiro positivo |
| preco_unitario | Valor não negativo, sem separador de milhar |
| custo_unitario | Custo de uma unidade; vazio quando desconhecido |
| taxas | Total de taxas da linha, não por unidade; vazio quando desconhecido |
| estoque | Saldo global do SKU na data; inteiro não negativo ou vazio |
| status | pago, cancelado ou devolvido |

Todos os cabeçalhos são obrigatórios, mas custo, taxas e estoque aceitam células vazias.
Com delimitador ponto e vírgula, valores como `10,50` são aceitos.
Aspas e quebras de linha dentro de campos são suportadas.
Linhas repetidas para **data + pedido + SKU + canal** são rejeitadas; consolide parcelas do mesmo item antes de importar.
O mesmo SKU deve representar o mesmo produto em toda a base.

## Regras dos indicadores

- **Receita:** soma de quantidade × preço unitário de itens pagos, antes de custos e taxas.
- **Pedidos:** identificadores únicos de canal + pedido, contando apenas pedidos com itens pagos.
- **Resultado estimado:** receita − quantidade × custo unitário − taxas por linha.
- **Margem estimada:** resultado / receita × 100; não calculada para receita zero.
- Se faltar custo ou taxa em qualquer linha paga filtrada, resultado e margem ficam indisponíveis.
- Custos fixos, impostos, frete ou outras despesas não informadas não são deduzidos. O resultado não é lucro líquido contábil.
- Cancelamentos e devoluções são excluídos integralmente. Devoluções parciais e conciliação financeira não estão implementadas.
- Atalhos terminam na última data da base. Datas inicial e final são inclusivas.
- **Curva ABC:** ordenação por faturamento, com A até aproximadamente 80%, B até 95% e C restante. O item que atravessa o limite permanece na classe que iniciou; não são percentuais da quantidade de SKUs.
- **Estoque:** último saldo não vazio por SKU na base completa; se houver vários na mesma data, prevalece o último registro. Não soma saldos de canais. Forneça um saldo global consolidado.
- **Cobertura:** saldo / média diária de unidades pagas no intervalo e canal selecionados, arredondada para baixo. Estoque global permanece independente do canal. Até 10 dias: repor agora; até 30: repor em breve; acima: saudável. Sem vendas: sem giro; saldo zero: crítico.
- A cobertura pressupõe vendas constantes, sem entradas futuras ou prazo de fornecedor. É apoio à análise, não previsão garantida.

## Tecnologias e estrutura

React, TypeScript, Recharts e Vite. Esta versão não utiliza Python.

- `src/App.tsx`: interface, navegação e importação.
- `src/analytics.mjs`: validação CSV e cálculos independentes da interface.
- `src/styles.css`: estilos adaptados do protótipo original.
- `tests/`: testes dos cálculos e fluxos do navegador.
- `docs/ROTEIRO-VIDEO.md`: apresentação de até cinco minutos.
- `docs/RESULTADOS.md`: texto sugerido para descrever esta implementação.
- `CODE`: referência histórica do código inicial; a aplicação executável usa os arquivos em `src/`.

## Limitações e privacidade

Esta é uma aplicação frontend, sem backend, banco de dados, login ou persistência.
Recarregar restaura os dados fictícios. Arquivos importados são processados no navegador e não enviados a servidor pela aplicação.
Não publique dados reais de clientes ou credenciais.

**Não há conexão real com APIs de marketplaces, importação automática de relatórios nativos, IA generativa ou previsão de vendas.**
A tela Marketplaces identifica as origens da base; não simula contas conectadas.
Conexões futuras exigem backend, OAuth e gestão segura de tokens.

O código público demonstra funcionalidades técnicas. Não comprova sozinho atendimento a lojas reais ou impactos financeiros; esses resultados precisam de evidências próprias.

## Entrega acadêmica

Use o link deste repositório, com a versão final incorporada à branch principal.
Siga o roteiro do vídeo, grave o sistema funcionando e inclua o endereço do vídeo no relatório.
Nenhum vídeo foi gravado ou publicado automaticamente.
