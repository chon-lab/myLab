# Documentos no MinIO

## Configuração local

1. Copie a licença AIStor Free recebida para `.secrets/minio.license`. A pasta e arquivos de licença são ignorados pelo Git.
2. Defina `MINIO_ROOT_PASSWORD` no `.env`; o backend local usa essas mesmas credenciais.
3. Inicie MariaDB e MinIO na raiz com `docker compose up -d mariadb minio`.
4. Inicie o backend. Na inicialização, ele cria o bucket privado definido por `MINIO_BUCKET` caso ainda não exista.
5. A Console local fica em `http://localhost:9001` e a API S3 em `http://localhost:9000`.

O padrão local usa `mylab_minio` e `change-this-minio-password`; troque essa senha antes de subir o serviço. O backend local se conecta pelo endpoint `http://localhost:9000`. Se o backend passar a rodar como serviço do Compose, o endpoint deve ser `http://minio:9000`.

## API de projetos

As rotas atuais permanecem: `POST /api/v1/projects/{projectId}/documents`, `GET /api/v1/projects/{projectId}/documents/{documentId}` e `DELETE` nessa mesma rota. Os metadados seguem na tabela `project_document`; o campo `stored_path` agora guarda a chave do objeto no bucket. Arquivos locais antigos continuam sendo lidos e removidos de `MYLAB_DOCUMENTS_DIR`.

## API de documentos de entrada

- `GET /api/v1/inventory/entries/{entryId}/documents`: lista metadados.
- `POST /api/v1/inventory/entries/{entryId}/documents`: cria somente os metadados, em JSON com `documentNumber`, `issuer` e/ou `documentDate`.
- `POST /api/v1/inventory/entries/{entryId}/documents/file`: cria metadados e envia `file` como multipart; aceita também os campos textuais acima.
- `GET /api/v1/inventory/entries/{entryId}/documents/{documentId}`: consulta os metadados.
- `PUT /api/v1/inventory/entries/{entryId}/documents/{documentId}/file`: anexa um arquivo a um registro que ainda não tem arquivo.
- `GET /api/v1/inventory/entries/{entryId}/documents/{documentId}/file`: baixa o arquivo.
- `DELETE /api/v1/inventory/entries/{entryId}/documents/{documentId}`: exclui o registro e, se existir, o objeto.

Os metadados também aparecem em `GET /api/v1/inventory/entries/{entryId}`. A tabela `inventory_movement_document` armazena número, emissor, data, nome, tipo, tamanho, SHA-256 e chave do objeto. A associação só aceita movimentos do tipo `ENTRY`.
