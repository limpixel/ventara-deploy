import os

from config import (
    ACTIVE_DATASET_FILE,
    DEFAULT_DATASET,
    ALLOWED_EXTENSIONS
)

# =========================
# GET ACTIVE DATASET
# =========================
def get_active_dataset_path() -> str:

    if os.path.exists(ACTIVE_DATASET_FILE):

        with open(ACTIVE_DATASET_FILE, "r") as f:
            path = f.read().strip()

        if path and os.path.exists(path):
            return path

    return DEFAULT_DATASET


# =========================
# SET ACTIVE DATASET
# =========================
def set_active_dataset_path(
    path: str
) -> None:

    with open(ACTIVE_DATASET_FILE, "w") as f:
        f.write(path)


# =========================
# VALIDATE FILE
# =========================
def allowed_file(
    filename: str
) -> bool:

    return (
        "." in filename
        and
        filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )