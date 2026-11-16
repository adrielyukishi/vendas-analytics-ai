# Roteiro de demonstração — duração sugerida: 4min30s

Antes de gravar: executar `npm install` e `npm run dev`, abrir o sistema, fechar notificações e utilizar somente os dados fictícios.
Baixar previamente o CSV de exemplo na tela Importar e exportar.

| Tempo | Mostrar | Fala sugerida |
| --- | --- | --- |
| 0:00–0:30 | Visão geral e identificação do modo demonstração | Sou Adriel Yukishi, aluno de Ciência de Dados da UNINTER. Este projeto apresenta um protótipo para auxiliar pequenos empreendedores na interpretação de dados comerciais. Nesta demonstração, os dados são fictícios. |
| 0:30–1:10 | Indicadores, gráfico e botões de 7, 30 e 90 dias | O painel reúne receita, pedidos, ticket médio, resultado e margem estimados. Ao mudar o período, os indicadores e gráficos são recalculados sobre os mesmos registros. O resultado depende dos custos e taxas informados e não representa lucro líquido contábil. |
| 1:10–1:40 | Filtro de canal | Também é possível analisar um canal específico e observar sua evolução. Pedidos cancelados e devolvidos ficam fora dos indicadores. Os atalhos usam a última data da base. |
| 1:40–2:20 | Estoque e busca por SKU | A consulta de estoque apresenta o saldo mais recente informado e uma estimativa de cobertura baseada no ritmo de vendas do intervalo. A busca facilita localizar um produto. Os alertas ajudam a investigar necessidades de reposição. A estimativa depende da qualidade do saldo e não prevê mudanças futuras de demanda. |
| 2:20–2:55 | Curva ABC | A curva ABC organiza os produtos por faturamento. As classes A, B e C representam faixas aproximadas de 80%, 15% e 5% da receita, respeitando os limites entre produtos. Isso auxilia a identificar concentração e prioridades de análise. |
| 2:55–3:45 | Importar e exportar: selecionar o exemplo fictício e voltar ao painel | Além da base demonstrativa, o sistema aceita um CSV padronizado. O arquivo passa por validação de colunas, datas, números e duplicidades. Quando válido, substitui a base anterior; os dados são processados apenas no navegador. Também é possível exportar os registros filtrados. |
| 3:45–4:10 | Marketplaces | Esta versão utiliza dados demonstrativos ou CSV. Não há conexão real com APIs de marketplaces ou uso de IA generativa. Essas integrações dependem de desenvolvimento posterior e autorização das contas. |
| 4:10–4:30 | GitHub: README e pasta src | O código-fonte e as instruções estão no GitHub. O projeto foi desenvolvido com React e TypeScript, com cálculos separados da interface e testes automatizados. Sua contribuição é demonstrar uma forma acessível de transformar registros comerciais em informações para apoiar decisões. |

Grave a tela com sua narração, revise o vídeo e mantenha o total abaixo de cinco minutos.
Não declare testes aprovados antes de conferir a execução correspondente em Actions.
