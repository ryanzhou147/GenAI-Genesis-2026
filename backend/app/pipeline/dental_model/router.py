from fastapi import APIRouter

router = APIRouter(prefix="/pipeline/dental-model", tags=["Dental Model Pipeline"])


@router.get("")
def get_dental_model_pipeline() -> dict[str, object]:
    return {
        "name": "dental_model_pipeline",
        "steps": [
            "image_preprocessing",
            "teeth_detection",
            "tooth_segmentation",
            "3d_mouth_reconstruction",
        ],
        "output": "patient_dental_model",
        "status": "scaffolded",
    }
