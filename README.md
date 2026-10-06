# SpyCode

Site que audita a segurança de repositórios do GitHub e explica cada problema em português simples.
É o Projeto Integrador do curso de Desenvolvimento Full Stack do Senac.

## Como abrir o site

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `frontend/index.html` e escolha **Open with Live Server**.

O navegador abre a página e recarrega sozinho toda vez que você salvar um arquivo.

## Estrutura de pastas

```
Projeto-Integrador/
├── frontend/              tudo que o navegador abre
│   ├── index.html         página inicial (landing)
│   ├── css/
│   │   ├── base.css       cores, fontes e estilos de TODAS as páginas
│   │   └── landing.css    estilos só da página inicial
│   └── img/               logos e ilustrações usadas no site
├── docs/
│   └── design/            desenhos das telas (referência, não vão para o site)
├── .editorconfig          mesmo espaçamento no editor de todo mundo
├── .gitattributes         mesma quebra de linha em Windows, Mac e Linux
└── .gitignore             o que o Git nunca deve enviar (ex.: .env)
```

Quando o backend começar, ele vai para uma pasta `backend/` ao lado da `frontend/`.

## Quem cuida de quê

Cada pessoa trabalha nos **seus** arquivos. Assim duas pessoas nunca editam a mesma linha e o Git não gera conflito.

| Parte | Responsável | Arquivos |
| --- | --- | --- |
| Página inicial | Samuel | `frontend/index.html`, `frontend/css/landing.css` |
| Tela de login | Aline e Helena | `frontend/login.html`, `frontend/css/login.css` |
| Estilos compartilhados | o grupo todo | `frontend/css/base.css` |

- Cada página nova tem **um HTML e um CSS com o mesmo nome**.
- Toda página carrega primeiro o `base.css` e depois o CSS dela:

  ```html
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/login.css">
  ```

- `base.css` só muda com o grupo de acordo, porque mexe no site inteiro.
- Imagem nova vai para `frontend/img/`. Desenho de tela vai para `docs/design/`.

## Cores e fontes

Não digite o código da cor. Use a variável que está no `base.css`:

```css
.meu_botao {
    background: var(--degrade);
    color: var(--texto-sobre-verde);
    font-family: var(--fonte-titulo);
}
```

- **Verde** (`--verde`, `--verde-agua`, `--degrade`) é a cor de ação: botões, menu e destaques.
- **Vermelho, laranja, amarelo e azul** (`--critico`, `--alto`, `--medio`, `--baixo`) são só para a severidade dos achados.
- Texto em cima de botão verde é sempre escuro (`--texto-sobre-verde`), nunca branco.

## Padrão de nomes

- **Arquivos e pastas:** letras minúsculas, sem acento e sem espaço. Use hífen para separar palavras: `logo-escuro.jpg`, `login.html`.
- **Classes e ids do CSS:** em português, separados por sublinhado, como já está no código: `botao_comecar`, `hero_texto`.
- **Comentários:** em português, explicando o porquê do trecho.

## Como trabalhar com o Git

Cada pessoa tem a sua branch: `branch-Samuel`, `branch-Aline` e `branch-Helena`. A `main` só recebe código revisado.

```bash
# 1. Entrar na sua branch
git checkout branch-SeuNome

# 2. Trazer o que já entrou na main. Faça sempre antes de começar.
git pull origin main

# 3. Salvar e enviar o seu trabalho
git add .
git commit -m "landing: estiliza os cards"
git push origin branch-SeuNome
```

4. No GitHub, abra um **Pull Request** da sua branch para a `main`.
5. Outra pessoa do grupo revisa e aprova. Só então ele entra na `main`.

A mensagem de commit começa pela parte que você mexeu (`landing:`, `login:`, `base:`) e diz o que mudou.

## Combinados do time

1. Todo pull request passa por revisão de outra pessoa.
2. Quem abriu o PR precisa saber explicar cada linha. Código gerado por IA sem entendimento não entra.
3. Atualização curta no grupo duas vezes por semana.
4. Código congelado duas semanas antes da entrega.
