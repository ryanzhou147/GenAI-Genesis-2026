from fastapi import APIRouter

router = APIRouter(prefix="/agents/clinic-locator", tags=["Clinic Locator Agent"])


@router.get("")
def get_clinic_locator_agent() -> dict[str, object]:
    return {
        "agent": "clinic_locator",
        "goal": "Find clinics and schedule follow-up care.",
        "status": "scaffolded",
    }
