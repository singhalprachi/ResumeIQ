from fastapi import APIRouter, HTTPException, status, Depends

from app.models.auth_schemas import (
    RegisterRequest, LoginRequest,
    AuthResponse, UserOut, MessageResponse,
)
from app.services.user_db import find_user_by_email, create_user
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/auth/register", response_model=AuthResponse, summary="Create a new account")
async def register(body: RegisterRequest):
    # Check duplicate email
    if find_user_by_email(body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    hashed = hash_password(body.password)
    user   = create_user(body.name, body.email, hashed)
    token  = create_access_token(user["id"], user["email"])

    return AuthResponse(
        access_token=token,
        user=UserOut(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"],
        ),
    )


@router.post("/auth/login", response_model=AuthResponse, summary="Log in to your account")
async def login(body: LoginRequest):
    user = find_user_by_email(body.email)

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token(user["id"], user["email"])

    return AuthResponse(
        access_token=token,
        user=UserOut(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            created_at=user["created_at"],
        ),
    )


@router.get("/auth/me", response_model=UserOut, summary="Get current user info")
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"],
    )


@router.post("/auth/logout", response_model=MessageResponse, summary="Log out")
async def logout(current_user: dict = Depends(get_current_user)):
    # JWT is stateless — client just deletes the token
    return MessageResponse(message="Logged out successfully.")
