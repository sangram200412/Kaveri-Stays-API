import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.account import Account


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = "change-this-secret-key"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


security = HTTPBearer()


# ============================================================
# PASSWORD
# ============================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ============================================================
# ACCESS TOKEN
# ============================================================

def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# REFRESH TOKEN
# ============================================================

def create_refresh_token(data: dict) -> str:

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        days=REFRESH_TOKEN_EXPIRE_DAYS
    )

    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# CURRENT ACCOUNT
# ============================================================

def get_current_account(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials.strip()

    # Remove accidental quotes copied from Swagger
    token = token.strip('"').strip("'")

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        token_type = payload.get("type")

        if token_type != "access":
            raise HTTPException(
                status_code=401,
                detail="Access token required"
            )

        account_id = payload.get("sub")

        if account_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        account_id = int(account_id)

    except HTTPException:
        raise

    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    account = (
        db.query(Account)
        .filter(
            Account.account_id == account_id
        )
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=401,
            detail="Account not found"
        )

    return account


# ============================================================
# ROLE DEPENDENCY
# ============================================================

def require_roles(*allowed_roles):

    def role_checker(
        current_account: Account = Depends(get_current_account)
    ):

        if current_account.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions"
            )

        return current_account

    return role_checker


# ============================================================
# OWNER ONLY
# ============================================================

def require_owner(
    current_account: Account = Depends(get_current_account)
):
    if current_account.role != "owner":
        raise HTTPException(
            status_code=403,
            detail="Owner access required"
        )

    return current_account


# ============================================================
# STAFF / MANAGER / OWNER
# ============================================================

def require_staff_or_manager_or_owner(
    current_account: Account = Depends(get_current_account)
):

    if current_account.role not in {
        "staff",
        "manager",
        "owner"
    }:
        raise HTTPException(
            status_code=403,
            detail="Staff, manager or owner access required"
        )

    return current_account


# ============================================================
# REFRESH TOKEN HASH
# ============================================================

def hash_refresh_token(token: str) -> str:

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()