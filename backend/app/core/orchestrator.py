from fastapi import APIRouter

router = APIRouter(prefix="/orchestrator", tags=["Agent Orchestrator"])


@router.get("")
def get_orchestrator() -> dict[str, object]:
    return {
        "name": "agent_orchestrator",
        "sequence": [
            "treatment_predictive",
            "habit_coaching",
            "financial",
            "clinic_locator",
            "monitoring",
        ],
        "status": "scaffolded",
    }
