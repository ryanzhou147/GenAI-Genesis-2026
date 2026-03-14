from fastapi import APIRouter

router = APIRouter(prefix="/agents/financial", tags=["Financial Agent"])


@router.get("")
def get_financial_agent() -> dict[str, object]:
    return {
        "agent": "financial",
        "goal": "Estimate insurance coverage and treatment cost exposure.",
        "status": "scaffolded",
    }
