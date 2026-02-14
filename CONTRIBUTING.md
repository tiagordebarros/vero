Guia de Contribuição e Arquitetura do Vero

Obrigado por considerar contribuir para o Vero!

Para manter o Vero leve, rápido e bonito, seguimos uma filosofia de arquitetura
rígida. Por favor, leia este documento antes de abrir um Pull Request. PRs que
violem os princípios abaixo serão convidados a serem refatorados.

🏛️ A Filosofia do Vero

O Vero resolve o paradoxo entre Simplicidade e Poder através de uma arquitetura
modular.

1. The Core Law (A Lei do Núcleo)

O Core do Vero deve permanecer mínimo, agnóstico e livre de dependências de
runtime.

O que pertence ao Core:

Lógica de renderização básica (o "motor" visual).

Wrapper seguro do console nativo.

Sistema de carregamento de Configuração e Plugins.

Tratamento de erros fundamentais.

O que NÃO pertence ao Core:

Integrações com serviços terceiros (Slack, Datadog, Sentry, etc).

Temas complexos adicionais (exceto o Default).

Formatadores de dados específicos (ex: formatador de XML ou SQL complexo).

A Regra de Ouro da Dependência: O Core NÃO deve conter dependências de produção
(dependencies). Se a sua funcionalidade exige instalar um pacote externo para
funcionar em tempo de execução, ela obrigatoriamente deve ser um Plugin.

2. Configuração: JSONC Opcional

Adotamos o padrão "Zero Configuração, mas Totalmente Configurável".

O Vero funciona imediatamente sem nenhum arquivo de configuração.

A personalização é feita através de um arquivo vero.config.jsonc na raiz do
projeto.

Utilizamos JSONC (JSON com Comentários) para permitir documentação inline.

Exemplo de estrutura aceita:

{ "theme": "dracula", // Tema visual "timestamp": false, // Ocultar hora
"plugins": [ "vero-plugin-sentry", // Plugins externos com dependências próprias
"vero-plugin-sql-formatter" ] }

3. Plugins e Extensibilidade

Preferimos Composição. O Vero expõe uma API simples para plugins manipularem a
entrada (logs) antes da saída (renderização).

Se você quer adicionar uma nova funcionalidade:

Verifique se ela pode ser feita via Plugin.

Se sim, crie um pacote separado (ex: @tiagordebarros/vero-plugin-xyz) ou
proponha um plugin oficial na pasta /plugins.

🌳 Padrões de Git Flow (Branches e Commits)

Para manter a organização e permitir automação, somos rigorosos com a
nomenclatura de branches e commits.

Nomeação de Branches (Branch Naming)

Antes de criar um PR, crie uma branch que descreva o trabalho que está sendo
feito. Utilize o mesmo prefixo do Conventional Commits, sempre em inglês e
kebab-case.

Formato:
<type>/<short-description>

Tipos aceitos (mesmos do commit):

feat/ (Nova funcionalidade)

fix/ (Correção de bug)

docs/ (Documentação)

chore/ (Manutenção, dependências)

refactor/ (Refatoração de código)

test/ (Testes)

Exemplos:

✅ feat/add-json-parser

✅ fix/ansi-color-windows

✅ docs/update-contributing-guide

❌ minha-nova-feature (Sem tipo e em português)

❌ feat/add_json_parser (Use kebab-case, não snake_case)

Semantic Versioning (SemVer)

O número da versão do Vero (ex: 1.2.4) segue a regra MAJOR.MINOR.PATCH:

MAJOR (1.x.x): Mudanças incompatíveis na API.

MINOR (x.2.x): Novas funcionalidades que mantêm compatibilidade.

PATCH (x.x.4): Correções de bugs sem adicionar features.

Conventional Commits

Todos os commits devem seguir a especificação Conventional Commits. Isso permite
que nossas ferramentas leiam o histórico e gerem o Changelog automaticamente.
Recomendamos fortemente escrever as mensagens de commit em inglês.

A estrutura completa de um commit é:

<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

Exemplos de formatos básicos:

feat: add native support for Deno (Gera uma release MINOR)

fix: correct warning alert color (Gera uma release PATCH)

docs: update readme with new flag (Não gera release)

chore: update dev dependencies (Não gera release)

refactor: improve parser performance

test: add unit tests for logger class

Exemplo Completo (com Breaking Change):

feat(core)!: redesign plugin API architecture

This commit completely overhauls the way plugins are registered in the core
logger. The previous method `logger.add()` has been removed in favor of
`logger.use()`.

BREAKING CHANGE: The `add()` method is no longer available. All existing plugins
must migrate to the new `use()` method. Closes #123

✅ Checklist para Pull Requests

Antes de submeter, verifique:

$$$$

Minha branch segue o padrão type/description em inglês?

$$$$

Minha alteração aumenta o tamanho do bundle principal (Core)? Se sim, é
justificado?

$$$$

CRÍTICO: Adicionei novas dependências ao projeto principal? (Isso resultará em
rejeição do PR).

$$$$

O código respeita a configuração definida no vero.config.jsonc (se aplicável)?

$$$$

Mantive a compatibilidade com o console nativo?

$$$$

Meus commits seguem o padrão Conventional Commits?

"A perfeição não é alcançada quando não há mais nada a acrescentar, mas quando
não há mais nada a retirar." — Antoine de Saint-Exupéry
