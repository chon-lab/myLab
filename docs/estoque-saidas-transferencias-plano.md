# Estoque — plano de saídas e transferências

## Objetivo

Evoluir o módulo de estoque para permitir a retirada de itens de um laboratório e a transferência de itens entre laboratórios do mesmo grupo de pesquisa, preservando o histórico de todas as movimentações.

O fluxo deve permanecer simples: o usuário consulta o saldo, inicia uma movimentação e informa somente os dados necessários. O saldo não será editado diretamente, pois será sempre calculado a partir das entradas, saídas e transferências confirmadas.

## Experiência na tela de estoque

A datatable de estoque será uma visão consolidada e predominantemente de leitura. Ela não permitirá excluir uma linha ou alterar diretamente sua quantidade.

Exemplo:

```text
Laboratório: [Todos os laboratórios ▼]   Buscar item: [____________]

| Item           | Unidade | Quantidade | Valor total | Ações          |
|----------------|---------|-----------:|------------:|----------------|
| Mouse Logitech | un.     |         10 | R$ 899,90   | Ver detalhes   |
| Monitor LG     | un.     |          5 | R$ 5.999,95 | Ver detalhes   |
|                |         |            | R$ 6.899,85 |                |
```

A tabela poderá oferecer as seguintes ações contextuais:

- `Ver detalhes`;
- `Registrar saída`;
- `Transferir`.

Ao clicar em `Registrar saída`, a aplicação abrirá uma página ou modal com o item e o laboratório já preenchidos. O usuário informará quantidade, tipo da saída, data e observação.

Ao clicar em `Transferir`, a aplicação abrirá o fluxo de transferência com o laboratório de origem e o item já preenchidos. O usuário escolherá o laboratório de destino, a quantidade, a data e uma observação opcional.

As mesmas operações também poderão ser iniciadas por telas próprias, permitindo adicionar vários itens em uma única saída ou transferência.

## Operações diferentes

Retirar quantidade do estoque não significa excluir o cadastro do item:

- arquivar `inventory_item` impede o uso futuro daquele item do catálogo;
- registrar uma saída reduz a quantidade disponível e mantém o histórico;
- transferir muda a localização do saldo sem alterar o total do grupo;
- corrigir uma entrada, saída ou transferência deve ser feito por estorno.

Não haverá botão `Excluir do estoque` na datatable.

## Saída de item

Uma saída representa uma retirada definitiva do estoque do grupo. Na primeira versão serão utilizados tipos simples:

- `CONSUMPTION`: item utilizado ou consumido;
- `DISPOSAL`: descarte por dano, vencimento ou inutilização;
- `LOSS`: perda ou extravio.

Empréstimos não fazem parte desta etapa, pois exigem controle de responsável, prazo e devolução.

### Dados da saída

O cabeçalho registra o contexto da operação:

```text
inventory_exit
├── id
├── research_group_id
├── laboratory_id
├── exit_type
├── occurred_at
├── notes
├── status
├── created_at
├── reversed_at
└── reversal_reason
```

Cada item retirado será uma linha:

```text
inventory_exit_item
├── id
├── inventory_exit_id
├── inventory_item_id
├── quantity
└── unit_cost
```

Uma saída com cinco mouses e dois monitores criará uma linha em `inventory_exit` e duas linhas em `inventory_exit_item`.

### Criação da saída

```http
POST /api/v1/research-groups/{groupId}/inventory/exits
```

Exemplo:

```json
{
  "laboratoryId": "UUID_DO_LABORATORIO",
  "type": "CONSUMPTION",
  "occurredAt": "2026-09-19",
  "notes": "Materiais utilizados no experimento",
  "items": [
    {
      "inventoryItemId": "UUID_DO_MOUSE",
      "quantity": 5
    },
    {
      "inventoryItemId": "UUID_DO_MONITOR",
      "quantity": 2
    }
  ]
}
```

O usuário não informará o custo do item. O backend calculará o custo médio atual no laboratório e armazenará o valor em `unit_cost`, preservando o valor histórico retirado do estoque.

### Validações da saída

- grupo, laboratório e itens devem existir;
- laboratório e itens devem pertencer ao grupo informado;
- itens devem estar ativos;
- quantidade deve ser positiva e compatível com a unidade de medida;
- o mesmo item não poderá aparecer duas vezes na operação;
- o laboratório deve possuir saldo suficiente;
- uma saída não poderá deixar saldo negativo;
- cabeçalho e linhas devem ser persistidos em uma única transação;
- se qualquer linha for inválida, nenhuma parte da saída será salva.

## Transferência entre laboratórios

Uma transferência é uma movimentação interna. Ela diminui o saldo do laboratório de origem e aumenta o saldo do laboratório de destino, sem alterar a quantidade nem o valor total do grupo.

Exemplo:

```text
Antes:
Lab A: 10 monitores
Lab B:  2 monitores
Grupo: 12 monitores

Transferência de 3 monitores do Lab A para o Lab B

Depois:
Lab A:  7 monitores
Lab B:  5 monitores
Grupo: 12 monitores
```

### Dados da transferência

```text
inventory_transfer
├── id
├── research_group_id
├── source_laboratory_id
├── destination_laboratory_id
├── transferred_at
├── notes
├── status
├── created_at
├── reversed_at
└── reversal_reason
```

```text
inventory_transfer_item
├── id
├── inventory_transfer_id
├── inventory_item_id
├── quantity
└── unit_cost
```

### Criação da transferência

```http
POST /api/v1/research-groups/{groupId}/inventory/transfers
```

Exemplo:

```json
{
  "sourceLaboratoryId": "UUID_DO_LAB_A",
  "destinationLaboratoryId": "UUID_DO_LAB_B",
  "transferredAt": "2026-09-19",
  "notes": "Transferência para montagem do novo laboratório",
  "items": [
    {
      "inventoryItemId": "UUID_DO_MONITOR",
      "quantity": 2
    },
    {
      "inventoryItemId": "UUID_DO_MOUSE",
      "quantity": 5
    }
  ]
}
```

O backend calculará o custo médio do item no laboratório de origem. Exatamente a mesma quantidade e o mesmo valor serão retirados da origem e adicionados ao destino.

### Validações da transferência

- origem e destino devem existir e pertencer ao mesmo grupo;
- laboratório de origem deve ser diferente do laboratório de destino;
- origem deve possuir saldo suficiente para todos os itens;
- quantidade deve ser positiva e compatível com a unidade de medida;
- o mesmo item não poderá aparecer duas vezes;
- toda a transferência deve acontecer em uma única transação;
- se qualquer item não possuir saldo, nenhuma parte da transferência será salva;
- transferências simultâneas não poderão produzir saldo negativo.

## Cálculo do saldo

O saldo de um laboratório será calculado por:

```text
Saldo do laboratório =
    entradas confirmadas
  + transferências recebidas confirmadas
  - transferências enviadas confirmadas
  - saídas confirmadas
```

No estoque consolidado do grupo, as transferências internas se anulam:

```text
Saldo do grupo =
    entradas confirmadas
  - saídas confirmadas
```

Somente movimentações com status `CONFIRMED` participarão do saldo.

## Valor do estoque

Na primeira versão, saídas e transferências utilizarão custo médio ponderado:

```text
Custo médio = valor atual do item no laboratório ÷ quantidade atual
```

Exemplo:

```text
Quantidade: 10
Valor: R$ 1.000,00
Custo médio: R$ 100,00

Saída de 3 unidades:
Quantidade retirada: 3
Valor retirado: R$ 300,00
```

O custo calculado será persistido na linha da movimentação para preservar o histórico, mesmo que novas entradas alterem o custo médio posteriormente.

## Histórico, detalhes e estorno

Endpoints recomendados para saídas:

```http
GET  /api/v1/research-groups/{groupId}/inventory/exits
GET  /api/v1/inventory/exits/{exitId}
POST /api/v1/inventory/exits/{exitId}/reverse
```

Endpoints recomendados para transferências:

```http
GET  /api/v1/research-groups/{groupId}/inventory/transfers
GET  /api/v1/inventory/transfers/{transferId}
POST /api/v1/inventory/transfers/{transferId}/reverse
```

O estorno não apagará a movimentação. Ele alterará seu status para `REVERSED`, armazenará data e motivo e fará com que ela deixe de participar do cálculo do saldo.

No estorno de uma transferência, o efeito é revertido nos dois laboratórios: a origem recupera o saldo e o destino deixa de possuir a quantidade transferida. Antes do estorno, o backend deverá garantir que o laboratório de destino ainda possui saldo suficiente para a reversão.

## Telas previstas

```text
Tela de estoque
├── visualizar saldo
├── filtrar por laboratório e item
├── ver detalhes
├── atalho para registrar saída
└── atalho para transferir

Tela de nova saída
├── selecionar laboratório
├── selecionar tipo
├── adicionar itens e quantidades
└── confirmar

Tela de nova transferência
├── selecionar origem e destino
├── adicionar itens e quantidades
└── confirmar

Histórico de saídas
└── consultar detalhes e estornar

Histórico de transferências
└── consultar detalhes e estornar
```

## Ordem sugerida de implementação

1. Criar tabelas e domínio de saída.
2. Implementar criação de saída e validação de saldo.
3. Atualizar a consulta consolidada de estoque.
4. Implementar histórico, detalhe e estorno de saída.
5. Criar tabelas e domínio de transferência.
6. Implementar criação de transferência.
7. Incluir transferências no cálculo do saldo por laboratório.
8. Implementar histórico, detalhe e estorno de transferência.
9. Cobrir cálculos, transações, saldo insuficiente e estornos com testes automatizados.

## Fora do escopo inicial

- empréstimos e devoluções;
- reserva de materiais;
- aprovação de movimentações;
- identificação individual por número de patrimônio ou número de série;
- escolha manual de lotes para saída;
- integração de saídas com projetos e usuários;
- inventário físico e ajustes automáticos.
