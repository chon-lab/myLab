# Tela de membros

A lista combina `GET /research-groups/{id}/people` e `GET /research-groups/{id}/members` pelo `personId`. O escopo das consultas inclui o grupo atual fornecido por `useResearchGroup()`. A resposta de membros contém apenas vínculos ativos; por isso, a tela lista somente pessoas ativas e não oferece reativação de vínculos inativos.

O backend atual também pode retornar `role` (`ADMIN`, `RESPONSIBLE`, `STUDENT`, `PARTNER`) após a migração V18. A interface exibe e filtra esse valor quando presente; vínculos anteriores à migração podem vir sem perfil e são identificados como “Perfil não informado”. Os perfis são metadados do vínculo. A API ainda não autentica usuários nem aplica permissões por perfil, então as regras de movimentação de estoque mostradas no Figma ainda dependem de autenticação e autorização no backend.

CPF é mascarado na listagem. A edição salva dados pessoais com `PUT /people/{id}` e linhas/perfil do vínculo com `PATCH /research-groups/{id}/members/{personId}`. As duas operações são chamadas separadamente e não formam uma transação única; se a atualização do vínculo falhar depois do `PUT`, os dados pessoais já podem ter sido salvos.

A ação de detalhes consulta `GET /people/{id}` para exibir também telefone e áreas de atuação; CPF permanece mascarado. Remover um membro encerra apenas o vínculo com `PATCH /research-groups/{id}/members/{personId}` com `active: false`. O cadastro da pessoa permanece no sistema. Como a listagem de vínculos retorna somente os ativos, vínculos inativos não podem ser reativados por esta tela.
