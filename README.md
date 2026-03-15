# Dental Multi-Agent Scaffold

Minimal project scaffold for a patient-first dental workflow with:

- `frontend/`: Next.js + React + Tailwind shell
- `backend/`: FastAPI placeholder service

## Frontend sections

- User upload
- Shared dental model
- Agent orchestrator
- Treatment predictive agent
- Habit coaching agent
- Financial agent
- Clinic locator and scheduling agent
- Monitoring loop
- Final dashboard

## Backend placeholder

The FastAPI app is organized into folders for the core workflow:

- `backend/app/pipeline/dental_model/`
- `backend/app/core/`
- `backend/app/agents/treatment_predictive/`
- `backend/app/agents/habit_coaching/`
- `backend/app/agents/financial/`
- `backend/app/agents/clinic_locator/`
- `backend/app/agents/monitoring/`

The scaffold currently exposes:

- `GET /`
- `GET /health`
- `GET /pipeline/dental-model`
- `GET /orchestrator`
- `GET /agents/treatment-predictive`
- `GET /agents/habit-coaching`
- `GET /agents/financial`
- `GET /agents/clinic-locator`
- `GET /agents/monitoring`

## Architecture

The system uses an `Agent Orchestrator` to coordinate the six main agents in the dental workflow.

```mermaid
flowchart LR
    U[Agent Orchestrator]

    V[Visual Agent]
    F[Financial Agent]
    H[Habit Coaching Agent]
    Sx[Surgery Agent]
    D[Doctor Summary Agent]
    S[Scheduling Agent]

    U --> V
    U --> F
    U --> H
    U --> Sx
    U --> D
    U --> S
```

## Main agents

**Visual Agent: analyzes uploaded teeth images and identifies visible issues.**
<img height="400" alt="Image" src="https://github.com/user-attachments/assets/9ef14bc6-8d7a-48f1-b84e-86722defb369" />

**Financial Agent: retrieves and reasons over Sun Life insurance documentation using RAG.**
<img height="400" alt="Image" src="https://github.com/user-attachments/assets/e0124499-09e6-4050-8712-935ef380b9c6" />

**Habit Coaching Agent: generates personalized hygiene recommendations.**
<img height="400" alt="Image" src="https://github.com/user-attachments/assets/c424f254-3fcb-4077-b4ba-2c8fac1abb96" />

**Surgery Agent: runs a scan of the teeth and shows results.**
<img height="400" alt="Image" src="https://github.com/user-attachments/assets/20744082-43bd-44a6-8c4c-a95ce088e050" />

**Doctor Summary Agent: orchestrates all outputs into a concise provider report.**
<img height="400" alt="Image" src="https://github.com/user-attachments/assets/e5a95ca6-4bee-47be-b73c-fbc19ec2611d" />

**Scheduling Agent: pulls dentist information and availability for the user to schedule the next appointment.**
<img height="400" alt="Image" src="https://github.com/user-attachments/assets/dae30c92-8a61-4c96-95f7-0aa73b75c26e" />
