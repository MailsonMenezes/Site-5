from fastapi import APIRouter, HTTPException, status, Depends
from ..models import UserCreate, UserLogin, User, UserResponse, LoginResponse, StatusResponse
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
from ..database import users_collection
from ..utils import validate_cpf, validate_cnpj_with_name
import re

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=StatusResponse)
async def register_user(user_data: UserCreate):
    """Registra novo usuário com validação CPF/CNPJ"""
    
    # Verifica se email já existe
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        return StatusResponse(
            success=False, 
            message="Email já cadastrado"
        )
    
    # Remove caracteres especiais do CPF/CNPJ
    documento = re.sub(r'[^0-9]', '', user_data.cpf)
    
    # Verifica se documento já existe
    existing_doc = await users_collection.find_one({"cpf": user_data.cpf})
    if existing_doc:
        return StatusResponse(
            success=False, 
            message="CPF/CNPJ já cadastrado"
        )
    
    # Validação CPF ou CNPJ
    if len(documento) == 11:  # CPF
        if not validate_cpf(documento):
            return StatusResponse(
                success=False, 
                message="CPF inválido"
            )
    elif len(documento) == 14:  # CNPJ
        validation_result = await validate_cnpj_with_name(documento, user_data.nome_completo)
        if not validation_result["valid"]:
            return StatusResponse(
                success=False, 
                message=validation_result["message"]
            )
    else:
        return StatusResponse(
            success=False, 
            message="Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)"
        )
    
    # Cria usuário
    user = User(
        **user_data.dict(exclude={"senha"}),
        senha_hash=get_password_hash(user_data.senha)
    )
    
    try:
        result = await users_collection.insert_one(user.dict())
        return StatusResponse(
            success=True, 
            message="Usuário cadastrado com sucesso",
            data={"user_id": user.id}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/login", response_model=LoginResponse)
async def login_user(login_data: UserLogin):
    """Autentica usuário"""
    
    user = await users_collection.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.senha, user["senha_hash"]):
        return LoginResponse(
            success=False,
            message="Email ou senha incorretos"
        )
    
    # Cria token JWT
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Remove senha_hash da resposta
    user_response = UserResponse(**{k: v for k, v in user.items() if k != "senha_hash"})
    
    return LoginResponse(
        success=True,
        message="Login realizado com sucesso",
        user=user_response,
        token=access_token
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """Retorna informações do usuário logado"""
    
    user = await users_collection.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return UserResponse(**{k: v for k, v in user.items() if k != "senha_hash"})

@router.get("/validate-cpf/{cpf}")
async def validate_cpf_endpoint(cpf: str):
    """Valida CPF"""
    cpf_clean = re.sub(r'[^0-9]', '', cpf)
    is_valid = validate_cpf(cpf_clean)
    
    return {
        "valid": is_valid,
        "message": "CPF válido" if is_valid else "CPF inválido"
    }

@router.get("/validate-cnpj/{cnpj}/{nome}")
async def validate_cnpj_endpoint(cnpj: str, nome: str):
    """Valida CNPJ com nome da empresa"""
    result = await validate_cnpj_with_name(cnpj, nome)
    return result