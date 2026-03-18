"""
User model — for role-based access.
"""

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    uploads: int


class UsersListResponse(BaseModel):
    users: list[UserResponse]
