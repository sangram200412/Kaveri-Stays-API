from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.db import get_db
from app.models.account import Account
from app.models.refresh_token import RefreshToken

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    SECRET_KEY,
    ALGORITHM
)

from app.schemas.account import (
    AccountCreate,
    AccountResponse,
    LoginRequest,
    TokenResponse,
    RefreshRequest
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=AccountResponse,
    status_code=201
)
def register(
    account_data: AccountCreate,
    db: Session = Depends(get_db)
):
    # Check whether email already exists
    existing_account = (
        db.query(Account)
        .filter(Account.email == account_data.email)
        .first()
    )

    if existing_account:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    # Validate role
    allowed_roles = {
        "guest",
        "staff",
        "manager",
        "owner"
    }

    if account_data.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    # ========================================================
    # GUEST VALIDATION
    # ========================================================

    if account_data.role == "guest":

        if account_data.guest_id is None:
            raise HTTPException(
                status_code=400,
                detail="Guest account requires guest_id"
            )

        if account_data.property_id is not None:
            raise HTTPException(
                status_code=400,
                detail="Guest account cannot have property_id"
            )

    # ========================================================
    # STAFF / MANAGER VALIDATION
    # ========================================================

    elif account_data.role in {"staff", "manager"}:

        if account_data.property_id is None:
            raise HTTPException(
                status_code=400,
                detail="Staff and manager accounts require property_id"
            )

    # ========================================================
    # OWNER VALIDATION
    # ========================================================

    elif account_data.role == "owner":

        if (
            account_data.property_id is not None
            or account_data.guest_id is not None
        ):
            raise HTTPException(
                status_code=400,
                detail="Owner account cannot have property_id or guest_id"
            )

    # ========================================================
    # HASH PASSWORD
    # ========================================================

    hashed_password = hash_password(
        account_data.password
    )

    # ========================================================
    # CREATE ACCOUNT
    # ========================================================

    account = Account(
        email=account_data.email,
        hashed_password=hashed_password,
        role=account_data.role,
        property_id=account_data.property_id,
        guest_id=account_data.guest_id
    )

    db.add(account)
    db.commit()
    db.refresh(account)

    return account


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    # Find account by email
    account = (
        db.query(Account)
        .filter(Account.email == login_data.email)
        .first()
    )

    # Account not found
    if account is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(
        login_data.password,
        account.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # ========================================================
    # CREATE ACCESS TOKEN
    # ========================================================

    access_token = create_access_token({
        "sub": str(account.account_id),
        "role": account.role
    })

    # ========================================================
    # CREATE REFRESH TOKEN
    # ========================================================

    refresh_token = create_refresh_token({
        "sub": str(account.account_id)
    })

    # ========================================================
    # HASH REFRESH TOKEN
    # ========================================================

    refresh_token_hash = hash_refresh_token(
        refresh_token
    )

    # Current UTC time
    now = datetime.now(timezone.utc)

    # ========================================================
    # STORE REFRESH TOKEN IN DATABASE
    # ========================================================

    token_record = RefreshToken(
        account_id=account.account_id,
        token_hash=refresh_token_hash,
        expires_at=now + timedelta(days=7),
        created_at=now
    )

    db.add(token_record)
    db.commit()

    # ========================================================
    # RETURN TOKENS
    # ========================================================

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# ============================================================
# REFRESH TOKEN
# ============================================================

@router.post(
    "/refresh",
    response_model=TokenResponse
)
def refresh_token(
    refresh_data: RefreshRequest,
    db: Session = Depends(get_db)
):

    # Get refresh token from request
    refresh_token_value = refresh_data.refresh_token

    # ========================================================
    # HASH INCOMING REFRESH TOKEN
    # ========================================================

    token_hash = hash_refresh_token(
        refresh_token_value
    )

    # ========================================================
    # FIND TOKEN IN DATABASE
    # ========================================================

    token_record = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash
        )
        .first()
    )

    if token_record is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    # ========================================================
    # CHECK WHETHER TOKEN IS REVOKED
    # ========================================================

    if token_record.revoked_at is not None:
        raise HTTPException(
            status_code=401,
            detail="Refresh token has been revoked"
        )

    # ========================================================
    # CHECK TOKEN EXPIRY
    # ========================================================

    now = datetime.now(timezone.utc)

    if token_record.expires_at <= now:
        raise HTTPException(
            status_code=401,
            detail="Refresh token has expired"
        )

    # ========================================================
    # VERIFY JWT
    # ========================================================

    try:

        payload = jwt.decode(
            refresh_token_value,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        account_id = payload.get("sub")

        if account_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    # ========================================================
    # FIND ACCOUNT
    # ========================================================

    account = (
        db.query(Account)
        .filter(
            Account.account_id == int(account_id)
        )
        .first()
    )

    if account is None:
        raise HTTPException(
            status_code=401,
            detail="Account not found"
        )

    # ========================================================
    # REVOKE OLD REFRESH TOKEN
    # ========================================================

    token_record.revoked_at = now

    # ========================================================
    # CREATE NEW ACCESS TOKEN
    # ========================================================

    new_access_token = create_access_token({
        "sub": str(account.account_id),
        "role": account.role
    })

    # ========================================================
    # CREATE NEW REFRESH TOKEN
    # ========================================================

    new_refresh_token = create_refresh_token({
        "sub": str(account.account_id)
    })

    # ========================================================
    # HASH NEW REFRESH TOKEN
    # ========================================================

    new_refresh_token_hash = hash_refresh_token(
        new_refresh_token
    )

    # ========================================================
    # STORE NEW REFRESH TOKEN
    # ========================================================

    new_token_record = RefreshToken(
        account_id=account.account_id,
        token_hash=new_refresh_token_hash,
        expires_at=now + timedelta(days=7),
        created_at=now
    )

    db.add(new_token_record)

    # ========================================================
    # SAVE CHANGES
    # ========================================================

    db.commit()

    # ========================================================
    # RETURN NEW TOKEN PAIR
    # ========================================================

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }