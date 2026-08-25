# myLab

## 1. Problema principal

O problema central é a falta de gerenciamento do grupo de pesquisa como um todo: não há controle sobre a instituição à qual o grupo está vinculado, sobre os laboratórios dentro dessa instituição, sobre os projetos do grupo, nem sobre os itens que esses laboratórios possuem.

Dentro disso, os principais pontos são:

- **Controle de estoque** — os itens têm origens diferentes (doações de empresas, fomento do governo, doações de eventos) e não há visibilidade sobre valor e quantidade de cada item. Não se sabe quais itens são os mais caros e precisam ficar guardados em local trancado (o laboratório tem apenas um armário disponível para isso), nem quais itens precisam ser comprados ou onde encontrar algo que está em falta no estoque.
- **Vínculo com projetos** — toda saída de item para uso deve estar vinculada a um projeto do grupo.
- **Itens reutilizáveis** — precisam de dois estados possíveis na saída: exclusão permanente do estoque ou apenas "em uso" (retornável).

**Critério de sucesso:** o sistema é bem-sucedido quando o grupo consegue gerenciar sua estrutura (instituição, laboratórios, projetos, membros) e, dentro dela, saber a qualquer momento o que tem em estoque, quanto vale, onde está, quem retirou, para qual projeto foi usado, e quais itens precisam de reposição ou de guarda especial.

## 2. Perfis de usuário

| Perfil | Descrição |
|---|---|
| **Admin Geral** | Administração geral do sistema. |
| **Admin Grupo** | Administra um grupo de pesquisa específico. |
| **Responsável** | Responsável por laboratório(s) do grupo. |
| **Estudante** | Vinculado ao grupo, uso restrito (ver regras na seção 4). |
| **Parceiro** | Pessoa externa vinculada ao grupo via CPF, uso restrito (ver regras na seção 4). |

> Perfis e permissões detalhadas ainda podem ser refinados — ver seção 7, "Pontos em aberto".

## 3. Movimentação de estoque

Tipos de movimentação:

- Entrada
- Saída para utilização do grupo — deve estar vinculada a um projeto do grupo.
- Saída por descarte
- Saída por empréstimo — exige que a pessoa esteja cadastrada no grupo como Parceiro (com CPF).

Para itens reutilizáveis, a saída para uso pode resultar em dois estados:

- Exclusão permanente do item do estoque, ou
- **Em uso** — o item continua existindo no estoque, apenas com status alterado, até retornar.

## 4. Administração do estoque

A administração é centralizada por papel de acesso: Estudantes e Parceiros não podem gerenciar entrada e saída de produtos. Essa responsabilidade fica com Admin Geral, Admin Grupo e Responsáveis.

## 5. Estrutura do Grupo de Pesquisa

O Grupo de Pesquisa é o ponto de partida de todo o modelo de dados. É composto por pesquisadores e estudantes, e é a partir dele que as demais entidades são criadas e escopadas:

- O grupo de pesquisa é vinculado a uma instituição base (faculdade/universidade).
- A partir do grupo, criam-se laboratórios, sempre dentro de unidades da instituição base do grupo.
- O grupo desenvolve projetos, que geram conhecimento ou produtos.
- O grupo tem membros (estudantes e parceiros, vinculados via CPF no caso de parceiros — ver seção 2).
- Todo item de estoque pertence a um grupo de pesquisa e possui uma localização, que deve obrigatoriamente ser um laboratório pertencente à instituição desse grupo.
- Toda saída de item para uso deve estar vinculada a um projeto do grupo (ver seção 3).

Ou seja: instituição, laboratórios, projetos, membros e itens de estoque não existem soltos no sistema — todos são criados e consultados sempre no contexto de um grupo de pesquisa.

### Hierarquia

```text
Grupo de Pesquisa (entidade raiz)
├─ Instituição base
│  └─ Laboratórios (criados pelo grupo, dentro da instituição)
├─ Projetos
├─ Membros (Estudantes, Parceiros)
└─ Itens de estoque (localizados em um laboratório do grupo)
```

## 6. Referências externas / dados de origem

- **Espelho do grupo de pesquisa (CNPq/DGP):** [http://dgp.cnpq.br/dgp/espelhogrupo/819423](http://dgp.cnpq.br/dgp/espelhogrupo/819423) — fonte de dados básicos do grupo, além dos dados pessoais dos membros.
- **API de instituições:** [https://institutions.allquestions.eu/api/institutions](https://institutions.allquestions.eu/api/institutions) — possível fonte para cadastro/validação de instituições.

## 7. Pontos em aberto

- Detalhar permissões específicas de cada perfil (Admin Geral x Admin Grupo x Responsável) — hoje só está definida a restrição de Estudante/Parceiro.
- Definir regras de estoque mínimo, lote, validade e unidade de medida.
- Definir se haverá compartilhamento de itens entre laboratórios de um mesmo grupo (ou entre grupos).
- Definir fluxo de aprovação/devolução para saída por empréstimo.
- Definir como os dados do CNPq/DGP e da API de instituições serão importados (manual vs. integração automática).
