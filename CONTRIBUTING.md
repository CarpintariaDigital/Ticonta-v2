# 🤝 Guia de Contribuição — TiConta v2

Agradecemos o seu interesse em contribuir para o desenvolvimento do **TiConta v2 ERP**!  
Este documento define o fluxo de trabalho, padrões de código e diretrizes para garantir a qualidade, segurança e estabilidade do projeto.

---

## 📌 Fluxo de Trabalho (Fork & Pull Request)

1. **Faça um Fork** do repositório no GitHub para a sua conta pessoal.
2. **Clone o seu Fork** localmente:
   ```bash
   git clone https://github.com/SEU-UTILIZADOR/ticonta-v2.git
   cd ticonta-v2
   ```
3. **Crie uma branch de funcionalidade ou correção** a partir da branch `main`:
   ```bash
   git checkout -b feature/nome-da-sua-funcionalidade
   # ou
   git checkout -b fix/descricao-do-bugfix
   ```
4. **Implemente as suas alterações** mantendo a integridade dos testes e estilo de código.
5. **Execute os testes automatizados** (veja seção de Testes abaixo).
6. **Faça commit das suas alterações** seguindo o padrão de mensagens Convencionais.
7. **Envie a sua branch** para o seu repositório remoto:
   ```bash
   git push origin feature/nome-da-sua-funcionalidade
   ```
8. **Abra um Pull Request (PR)** apontando para a branch `main` do repositório oficial da Carpintaria Digital.

---

## 🎨 Padrões de Estilo de Código

### 🐍 Backend (Python / FastAPI)
- **Formatador:** [Black](https://github.com/psf/black) (comprimento de linha: 100 caracteres)
- **Imports:** [isort](https://pycqa.github.io/isort/)
- **Linter:** [Flake8](https://flake8.pycqa.org/)

```bash
cd backend
# Formatar e verificar estilo:
black app tests
flake8 app tests
```

### ⚛️ Frontend (TypeScript / React / Next.js)
- **Formatador:** [Prettier](https://prettier.io/)
- **Linter:** [ESLint](https://eslint.org/)

```bash
cd frontend
# Verificar linting e tipos TypeScript:
npm run lint
npx tsc --noEmit
```

---

## 🧪 Testes Automatizados

Todas as contribuições devem incluir testes correspondentes ou garantir que os testes existentes continuam a passar com 100% de sucesso.

### Backend (pytest)
```bash
cd backend
source venv/bin/activate
pytest -v --cov=app --cov-report=term-missing
```

### Frontend (vitest & Playwright)
```bash
cd frontend
# Executar testes unitários e de integração:
npm run test

# Executar testes end-to-end (opcional):
npx playwright test
```

---

## 📝 Convenção de Mensagens de Commit

Utilizamos a convenção **Conventional Commits**:

```
<tipo>(<escopo>): <descrição curta no imperativo>

[corpo opcional detalhando a motivação da alteração]

[rodapé opcional referenciando issues: Ex: Closes #42]
```

### Tipos Permitidos:
* `feat`: Nova funcionalidade para o utilizador.
* `fix`: Correção de bug.
* `docs`: Alteração apenas em ficheiros de documentação.
* `style`: Formatação, pontos e vírgulas em falta, sem impacto na lógica.
* `refactor`: Refatoração de código sem alterar comportamento externo.
* `test`: Adição ou correção de testes automatizados.
* `chore`: Atualização de tarefas de build, dependências ou ferramentas de CI.

#### Exemplos:
```bash
git commit -m "feat(pos): adicionar suporte a leitura de código de barras por webcam"
git commit -m "fix(accounting): corrigir apuramento de saldo na conta 4.1 clientes"
git commit -m "docs(api): atualizar exemplos de autenticação JWT"
```

---

## 📋 Modelo de Pull Request (Template)

Ao abrir um PR, utilize a seguinte estrutura na descrição:

```markdown
### 📝 Descrição da Alteração
<!-- Descreva sucintamente o que foi alterado ou implementado -->

### 🎯 Motivação & Contexto
<!-- Por que esta alteração é necessária? Resolve algum bug ou adiciona nova feature? -->
Fixes #(número da issue se aplicável)

### 🧪 Testes Realizados
- [ ] Testes unitários do backend executados com sucesso (`pytest`)
- [ ] Testes do frontend executados com sucesso (`npm run test`)
- [ ] Verificação manual em ambiente local realizada

### ✅ Checklist de Qualidade
- [ ] O código segue as diretrizes de estilo (Black / Prettier / ESLint)
- [ ] A documentação foi atualizada (se aplicável)
- [ ] Nenhuma chave secreta ou ficheiro `.env` foi incluído
```

---

## 🔐 Política de Segurança & Relato de Vulnerabilidades

Se descobrir uma vulnerabilidade de segurança, **NÃO** abra uma issue pública no GitHub.  
Por favor, envie um e-mail confidencial para: **`seguranca@ticonta.co.mz`** com os detalhes técnicos e passos para reprodução. A nossa equipa responderá em menos de 48 horas.
