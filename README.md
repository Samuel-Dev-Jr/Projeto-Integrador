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
│   ├── recursos.html      páginas do menu (ainda vazias)
│   ├── sobre.html
│   ├── seguranca.html
│   ├── css/
│   │   └── style.css      estilos da página inicial
│   ├── js/
│   │   └── terminal.js    animação do terminal da página inicial
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
| Página inicial | Samuel | `frontend/index.html`, `frontend/css/style.css` |
| Tela de login | Aline e Helena | `frontend/login.html`, `frontend/css/login.css` |

- Cada página nova tem **um HTML e um CSS com o mesmo nome**, como `login.html` e `css/login.css`.
- Página nova vai dentro de `frontend/`, nunca solta na raiz do projeto.
- Imagem nova vai para `frontend/img/`. Desenho de tela vai para `docs/design/`.

## Cores e fontes

O tema do site é o verde. Use sempre estes códigos, para todas as páginas ficarem iguais:

| Uso | Cor |
| --- | --- |
| Fundo principal | `#03110B` |
| Fundo de seção alternada | `#061A12` |
| Card | `#0A2419` |
| Borda | `#1F5C3D` |
| Texto principal | `#EAF7F0` |
| Texto secundário | `#9CB8AA` |
| Verde principal | `#2BD96B` |
| Verde-água | `#19B5A5` |
| Texto sobre fundo verde | `#02140C` |

- **Degradê** de botões, menu e faixa de destaque: `linear-gradient(90deg, #2BD96B, #19B5A5)`.
- **Verde** é a cor de ação: botões, menu e destaques.
- **Vermelho, laranja, amarelo e azul** são só para a severidade dos achados: crítico `#FF5C6C`, alto `#FF8A3D`, médio `#F5C542`, baixo `#5FB3D9`.
- Texto em cima de botão verde é sempre escuro (`#02140C`), nunca branco.
- **Fontes** (Google Fonts): Sora nos títulos, IBM Plex Sans no texto e IBM Plex Mono em código.

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

A mensagem de commit começa pela parte que você mexeu (`landing:`, `login:`) e diz o que mudou.

## Combinados do time

1. Todo pull request passa por revisão de outra pessoa.
2. Quem abriu o PR precisa saber explicar cada linha. Código gerado por IA sem entendimento não entra.
3. Atualização curta no grupo duas vezes por semana.
4. Código congelado duas semanas antes da entrega.
