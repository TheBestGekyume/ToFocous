# ToFocous

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-purple)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Python](https://img.shields.io/badge/backend-Python%20%2B%20FastAPI-3776AB)
![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E)

## Sobre o projeto

**ToFocous** é uma aplicação web para organização de tarefas, projetos e subtarefas, criada com foco em simplicidade, produtividade e facilidade de uso.

A proposta do sistema é permitir que o usuário organize sua rotina de forma prática, sem excesso de etapas ou configurações complexas. A aplicação trabalha com uma estrutura simples:

```txt
Projetos → Tarefas → Subtarefas
```

Cada projeto funciona como um espaço de organização, onde o usuário pode criar tarefas, definir prazos, acompanhar o status e dividir atividades maiores em subtarefas.

## Funcionalidades principais

- Criação e gerenciamento de projetos;
- Criação, edição e exclusão de tarefas;
- Organização de subtarefas;
- Definição de status das tarefas;
- Definição de prioridade;
- Datas de início e prazo;
- Visualização em agenda/calendário;
- Autenticação de usuários;
- Compartilhamento de projetos com outros usuários;
- Interface simples e responsiva.

## Objetivo

O objetivo do **ToFocous** é oferecer uma ferramenta direta para gerenciamento de tarefas, evitando interfaces muito carregadas ou fluxos complicados.

A aplicação foi pensada para usuários que desejam organizar melhor suas atividades pessoais, acadêmicas ou colaborativas, mantendo uma experiência simples e objetiva.

## Tecnologias utilizadas

### Frontend

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Framer Motion

### Backend

- Python
- FastAPI
- Pydantic
- Supabase
- PostgreSQL

## Estrutura geral

```txt
frontend/
  src/
    components/
    contexts/
    hooks/
    pages/
    providers/
    services/
    types/
    utils/

backend/
  core/
  dependencies/
  models/
  routers/
  services/
  main.py
```

## Status do projeto

O projeto ainda está em desenvolvimento.

Atualmente, o sistema já possui funcionalidades essenciais de gerenciamento de projetos, tarefas e subtarefas, além de autenticação e integração com banco de dados.

Novas melhorias estão sendo implementadas gradualmente.

## Próximos passos

- Melhorar a colaboração em tempo real;
- Aperfeiçoar permissões entre usuários;
- Melhorar a experiência mobile;
- Adicionar novas visualizações de produtividade;
- Refinar feedbacks visuais e tratamento de erros.

## Autor

Desenvolvido por **Gekyume Serna** e **Jonathan Bastos**.
