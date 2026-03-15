from __future__ import annotations

from typing import Any


async def run_orchestrator_probe() -> dict[str, Any]:
    """
    Execute a tiny Railtracks session if the package is available.

    This is intentionally isolated from the main app flow so we can validate a
    minimal integration without affecting any existing endpoint behavior.
    """
    try:
        import railtracks as rt  # type: ignore
    except Exception as exc:
        return {
            "enabled": False,
            "available": False,
            "framework": "railtracks",
            "message": "Railtracks is not installed; returning fallback response.",
            "error": str(exc),
        }

    @rt.function_node
    async def get_sequence() -> list[str]:
        return [
            "treatment_predictive",
            "habit_coaching",
            "financial",
            "doctor_summary",
        ]

    @rt.function_node
    async def build_payload(sequence: list[str]) -> dict[str, Any]:
        return {
            "enabled": True,
            "available": True,
            "framework": "railtracks",
            "message": "Minimal Railtracks probe executed successfully.",
            "sequence": sequence,
        }

    @rt.session(name="orchestrator-probe")
    async def probe():
        sequence = await rt.call(get_sequence)
        payload = await rt.call(build_payload, sequence=sequence)
        return payload

    result, session = await probe()
    result["session_name"] = getattr(session, "_identifier", "orchestrator-probe")
    return result
